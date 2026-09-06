// handler/product.go
package handler

import (
	"errors"
	"fiber-api/database"
	"fiber-api/helpers"
	"fiber-api/models"
	"fiber-api/validator"
	"math"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetProducts: GET /api/products
// handler/product.go — GetProducts dengan query builder
func GetProducts(c *fiber.Ctx) error {

	keyword := c.Query("keyword", "") // argumen ke dua dari c.Query adalah default value
	categoryID := c.QueryInt("category_id", 0)
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	// Mulai query — bisa di-chain bertahap
	query := database.DB.Model(&models.Product{})

	if keyword != "" {
		// ILIKE = LIKE case-insensitive (khusus PostgreSQL).
		// Di MySQL cukup LIKE karena collation default-nya sudah case-insensitive.
		query = query.Where("name ILIKE ?", "%"+keyword+"%")
	}
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}

	// Hitung total DULU (sebelum Offset/Limit!)
	var total int64     // total data dalam products
	query.Count(&total) // SELECT COUNT(*) FROM products WHERE...

	// Ambil data dengan paginasi + JOIN kategori
	var products []models.Product
	offset := (page - 1) * limit // untuk pagination
	query.
		Preload("Category"). // LEFT JOIN categories — ambil nama kategori
		Order("id desc").    // terbaru dulu
		Offset(offset).      // OFFSET untuk paginasi
		Limit(limit).        // LIMIT per halaman
		Find(&products)      // eksekusi query

	// Kembalikan dengan meta paginasi
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return helpers.OKWithMeta(c, "Data produk", products,
		&helpers.PaginationMeta{Page: page, Limit: limit,
			Total: total, TotalPages: totalPages})
}

// GetProductByID: GET /api/products/:id
func GetProductByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var product models.Product
	err = database.DB.Preload("Category").First(&product, id).Error

	if err != nil {
		// errors.Is() membedakan "tidak ditemukan" vs "error database"
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "Produk tidak ditemukan") // 404
		}
		// Error lain (koneksi putus, timeout, dll) → 500
		return helpers.InternalError(c, "Gagal mengambil data produk")
	}

	return helpers.OK(c, "Data ditemukan", product)
}

// Error GORM yang umum:
// gorm.ErrRecordNotFound — First() tidak menemukan data
// gorm.ErrInvalidDB      — koneksi database bermasalah
// .Error != nil          — selalu cek setelah Create/Save/Delete juga!

func CreateProduct(c *fiber.Ctx) error {
	var req models.CreateProductRequest

	// Parse JSON body → struct
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	if errs := validator.Validate(req); errs != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Validasi gagal",
			"errors":  errs,
		})
	}

	// Pastikan kategori yang direferensikan memang ada
	var category models.Category
	if err := database.DB.First(&category, req.CategoryID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.BadRequest(c, "Kategori tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal memvalidasi kategori")
	}

	// Map DTO -> model, JANGAN Create(&req) langsung
	product := models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		IsActive:    true,
		CategoryID:  req.CategoryID,
	}

	if err := database.DB.Create(&product).Error; err != nil {
		// Error lain (koneksi putus, timeout, dll) → 500
		return helpers.InternalError(c, "Gagal membuat data produk")
	}

	// Muat relasi Category untuk response
	database.DB.Preload("Category").First(&product, product.ID)

	// Sukses → 201 Created
	return helpers.Created(c, "Data Produk berhasil di buat", product)
}

// UpdateProduct: PUT /api/v1/products/:id — admin. Partial update.
//
// Image TIDAK diubah di sini — pakai endpoint /products/:id/image
// karena bentuk request-nya multipart, bukan JSON.
func UpdateProduct(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var req models.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return helpers.BadRequest(c, "Format JSON tidak valid")
	}
	if errs := validator.Validate(req); errs != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Validasi gagal",
			"errors":  errs,
		})
	}

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "Produk tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal mengambil data produk")
	}

	// Kumpulkan hanya field yang dikirim client.
	// Pakai map, bukan struct: Updates(struct) mengabaikan nilai nol,
	// jadi stock=0 atau is_active=false tidak akan pernah tersimpan.
	updates := map[string]interface{}{}

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.Stock != nil {
		updates["stock"] = *req.Stock
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}
	if req.CategoryID != nil {
		// Pastikan kategori tujuan ada — category_id NOT NULL + index,
		// tapi tidak ada FK constraint yang menjaga isinya.
		var category models.Category
		if err := database.DB.First(&category, *req.CategoryID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return helpers.BadRequest(c, "Kategori tidak ditemukan")
			}
			return helpers.InternalError(c, "Gagal memvalidasi kategori")
		}
		updates["category_id"] = *req.CategoryID
	}

	if len(updates) == 0 {
		return helpers.OK(c, "Tidak ada perubahan", product)
	}

	if err := database.DB.Model(&product).Updates(updates).Error; err != nil {
		return helpers.InternalError(c, "Gagal memperbarui produk")
	}

	database.DB.Preload("Category").First(&product, product.ID)
	return helpers.OK(c, "Produk berhasil diperbarui", product)
}

// DeleteProduct: DELETE /api/v1/products/:id — admin.
//
// Soft delete: barisnya hanya ditandai DeletedAt, jadi file image
// sengaja TIDAK dihapus supaya data masih bisa dipulihkan.
func DeleteProduct(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "Produk tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal mengambil data produk")
	}

	if err := database.DB.Delete(&product).Error; err != nil {
		return helpers.InternalError(c, "Gagal menghapus produk")
	}

	return helpers.OK(c, "Produk berhasil dihapus", nil)
}

func CreateCategoryAndProduct(c *fiber.Ctx) error {
	// Memulai transaksi otomatis
	return database.DB.Transaction(func(tx *gorm.DB) error {

		var req models.CreateProductAndCategoryRequest

		// Parse JSON body → struct
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Format JSON tidak valid",
			})
		}

		if errs := validator.Validate(req); errs != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Validasi gagal",
				"errors":  errs,
			})
		}

		// 1. Buat Kategori Baru.
		// Slug wajib diisi: kolomnya uniqueIndex, jadi kalau dibiarkan kosong
		// endpoint ini hanya berhasil sekali — panggilan kedua bentrok "" vs "".
		newCategory := models.Category{
			Name: req.Category,
			Slug: helpers.Slugify(req.Category),
		}
		if err := tx.Create(&newCategory).Error; err != nil {
			// Otomatis rollback jika error
			return err
		}

		// 2. Buat Produk Baru menggunakan ID dari kategori di atas
		newProduct := models.Product{
			Name:        req.Name,
			Description: req.Description,
			Price:       req.Price,
			Stock:       req.Stock,
			CategoryID:  newCategory.ID, // ID otomatis terisi setelah tx.Create kategori sukses
		}

		if err := tx.Create(&newProduct).Error; err != nil {
			// Otomatis rollback jika error, kategori yang dibuat di atas akan dibatalkan
			return err
		}

		// Jika return nil, GORM otomatis melakukan COMMIT
		return nil
	})
}
