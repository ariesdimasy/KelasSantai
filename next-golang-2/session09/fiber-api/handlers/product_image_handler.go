// handlers/product_image_handler.go
//
// Fitur upload file: 1 produk = MAKSIMAL 1 image.
//
// Aturan ini dijaga di dua lapis:
//  1. Model — kolom Product.Image hanya menampung satu path (bukan slice/tabel terpisah).
//  2. Handler — POST menolak (409) bila produk sudah punya image.
//     Untuk mengganti, pakai PUT (file lama dihapus). Untuk mengosongkan, pakai DELETE.
//
// Endpoint:
//
//	POST   /api/v1/products/:id/image   (multipart/form-data, field "image")
//	PUT    /api/v1/products/:id/image   (ganti image yang sudah ada)
//	DELETE /api/v1/products/:id/image
package handler

import (
	"errors"
	"fiber-api/database"
	"fiber-api/helpers"
	"fiber-api/models"
	"log"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// formFieldImage: nama field pada form-data yang dipakai client
const formFieldImage = "image"

// UploadProductImage: POST /api/v1/products/:id/image
// Menolak bila produk SUDAH punya image (batas 1 image per produk).
func UploadProductImage(c *fiber.Ctx) error {
	product, errResp := findProductForImage(c)
	if errResp != nil {
		return errResp
	}

	// Batas 1 image per produk
	if product.Image != "" {
		return helpers.Conflict(c,
			"Produk ini sudah memiliki image. Gunakan PUT untuk mengganti "+
				"atau DELETE untuk menghapus image lama")
	}

	return saveProductImage(c, product)
}

// ReplaceProductImage: PUT /api/v1/products/:id/image
// Mengganti image: file baru disimpan, file lama dihapus dari disk.
func ReplaceProductImage(c *fiber.Ctx) error {
	product, errResp := findProductForImage(c)
	if errResp != nil {
		return errResp
	}

	return saveProductImage(c, product)
}

// DeleteProductImage: DELETE /api/v1/products/:id/image
// Menghapus file dari disk dan mengosongkan kolom image.
func DeleteProductImage(c *fiber.Ctx) error {
	product, errResp := findProductForImage(c)
	if errResp != nil {
		return errResp
	}

	if product.Image == "" {
		return helpers.NotFound(c, "Produk ini belum memiliki image")
	}

	oldPath := product.Image

	// Update DB dulu — kalau gagal, file tetap utuh (tidak ada data yang
	// menunjuk ke file yang sudah terhapus).
	if err := database.DB.Model(product).
		Update("image", "").Error; err != nil {
		return helpers.InternalError(c, "Gagal menghapus image produk")
	}

	if err := helpers.RemoveFileIfExists(oldPath); err != nil {
		// DB sudah bersih, file sisa bukan masalah fatal — cukup dicatat.
		log.Printf("[WARN] gagal hapus file %s: %v", oldPath, err)
	}

	product.Image = ""
	return helpers.OK(c, "Image produk berhasil dihapus", product)
}

// --- helper internal -------------------------------------------------------

// findProductForImage memvalidasi :id dan mengambil produk dari DB.
// Mengembalikan (product, nil) saat sukses, atau (nil, response error).
func findProductForImage(c *fiber.Ctx) (*models.Product, error) {
	id, err := c.ParamsInt("id")
	if err != nil || id <= 0 {
		return nil, helpers.BadRequest(c, "ID harus berupa angka")
	}

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, helpers.NotFound(c, "Produk tidak ditemukan")
		}
		return nil, helpers.InternalError(c, "Gagal mengambil data produk")
	}

	return &product, nil
}

// saveProductImage: ambil file dari form-data, validasi, simpan ke disk,
// lalu update kolom image. File lama (kalau ada) dihapus setelah DB sukses.
func saveProductImage(c *fiber.Ctx, product *models.Product) error {
	// 1. Ambil file dari form-data
	fileHeader, err := c.FormFile(formFieldImage)
	if err != nil {
		return helpers.BadRequest(c,
			"File tidak ditemukan. Kirim sebagai multipart/form-data "+
				"dengan field \""+formFieldImage+"\"")
	}

	// 2. Validasi ekstensi, ukuran, dan isi file
	if err := helpers.ValidateImage(fileHeader); err != nil {
		return helpers.BadRequest(c, err.Error())
	}

	// 3. Pastikan folder tujuan ada
	if err := helpers.EnsureUploadDir(helpers.ProductImageDir); err != nil {
		log.Printf("[ERROR] gagal membuat folder upload: %v", err)
		return helpers.InternalError(c, "Gagal menyiapkan folder upload")
	}

	// 4. Simpan file dengan nama yang aman & unik
	filename := helpers.BuildImageFilename(product.ID, fileHeader.Filename)
	newPath := filepath.Join(helpers.ProductImageDir, filename)

	if err := c.SaveFile(fileHeader, newPath); err != nil {
		log.Printf("[ERROR] gagal menyimpan file %s: %v", newPath, err)
		return helpers.InternalError(c, "Gagal menyimpan file")
	}

	// 5. Update kolom image di DB
	oldPath := product.Image
	if err := database.DB.Model(product).
		Update("image", newPath).Error; err != nil {
		// DB gagal → buang file yang baru saja ditulis supaya tidak jadi orphan
		if rmErr := helpers.RemoveFileIfExists(newPath); rmErr != nil {
			log.Printf("[WARN] gagal rollback file %s: %v", newPath, rmErr)
		}
		return helpers.InternalError(c, "Gagal menyimpan data image produk")
	}

	// 6. DB sudah menunjuk file baru → file lama boleh dihapus
	if oldPath != "" && oldPath != newPath {
		if err := helpers.RemoveFileIfExists(oldPath); err != nil {
			log.Printf("[WARN] gagal hapus file lama %s: %v", oldPath, err)
		}
	}

	product.Image = newPath

	msg := "Image produk berhasil diupload"
	if oldPath != "" {
		msg = "Image produk berhasil diganti"
	}

	return helpers.OK(c, msg, fiber.Map{
		"id":        product.ID,
		"name":      product.Name,
		"image":     product.Image,
		"image_url": c.BaseURL() + helpers.PublicImageURL(product.Image),
	})
}
