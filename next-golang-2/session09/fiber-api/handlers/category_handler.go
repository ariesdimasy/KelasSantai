// handler/category.go — CRUD kategori
package handler

import (
	"errors"
	"fiber-api/database"
	"fiber-api/helpers"
	"fiber-api/models"
	"fiber-api/validator"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetCategories: GET /api/v1/categories — publik.
//
// Tidak dipaginasi: jumlah kategori sedikit dan frontend memakai
// daftar ini untuk mengisi dropdown filter/form produk.
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category

	query := database.DB.Model(&models.Category{})
	if keyword := c.Query("keyword", ""); keyword != "" {
		query = query.Where("name ILIKE ?", "%"+keyword+"%")
	}

	if err := query.Order("name asc").Find(&categories).Error; err != nil {
		return helpers.InternalError(c, "Gagal mengambil data kategori")
	}

	return helpers.OK(c, "Data kategori", categories)
}

// GetCategoryByID: GET /api/v1/categories/:id — publik.
func GetCategoryByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var category models.Category
	if err := database.DB.Preload("Products").First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "Kategori tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal mengambil data kategori")
	}

	return helpers.OK(c, "Data ditemukan", category)
}

// CreateCategory: POST /api/v1/categories — admin.
func CreateCategory(c *fiber.Ctx) error {
	var req models.CreateCategoryRequest
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

	slug := helpers.Slugify(req.Name)
	if slug == "" {
		return helpers.BadRequest(c, "Nama kategori harus mengandung huruf atau angka")
	}

	// Cek duplikat lebih dulu supaya pesannya jelas — kalau diserahkan ke
	// uniqueIndex, client cuma dapat error 500 dari driver.
	var count int64
	database.DB.Model(&models.Category{}).Where("slug = ?", slug).Count(&count)
	if count > 0 {
		return helpers.Conflict(c, "Kategori dengan nama itu sudah ada")
	}

	category := models.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
	}
	if err := database.DB.Create(&category).Error; err != nil {
		return helpers.InternalError(c, "Gagal membuat kategori")
	}

	return helpers.Created(c, "Kategori berhasil dibuat", category)
}

// UpdateCategory: PUT /api/v1/categories/:id — admin. Partial update.
func UpdateCategory(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var req models.UpdateCategoryRequest
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

	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "Kategori tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal mengambil data kategori")
	}

	// Hanya field yang dikirim yang diubah
	updates := map[string]interface{}{}

	if req.Name != "" && req.Name != category.Name {
		slug := helpers.Slugify(req.Name)
		if slug == "" {
			return helpers.BadRequest(c, "Nama kategori harus mengandung huruf atau angka")
		}
		// Kecualikan baris ini sendiri, kalau tidak update tanpa ganti nama
		// akan dianggap bentrok dengan dirinya sendiri.
		var count int64
		database.DB.Model(&models.Category{}).
			Where("slug = ? AND id <> ?", slug, category.ID).Count(&count)
		if count > 0 {
			return helpers.Conflict(c, "Kategori dengan nama itu sudah ada")
		}
		updates["name"] = req.Name
		updates["slug"] = slug
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	if len(updates) == 0 {
		return helpers.OK(c, "Tidak ada perubahan", category)
	}

	if err := database.DB.Model(&category).Updates(updates).Error; err != nil {
		return helpers.InternalError(c, "Gagal memperbarui kategori")
	}

	return helpers.OK(c, "Kategori berhasil diperbarui", category)
}

// DeleteCategory: DELETE /api/v1/categories/:id — admin.
//
// Soft delete (gorm.Model punya DeletedAt). Kategori yang masih dipakai
// produk ditolak: products.category_id NOT NULL, jadi produknya akan
// menggantung ke kategori yang tidak bisa dibaca lagi.
func DeleteCategory(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "Kategori tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal mengambil data kategori")
	}

	var productCount int64
	database.DB.Model(&models.Product{}).
		Where("category_id = ?", category.ID).Count(&productCount)
	if productCount > 0 {
		return helpers.Conflict(c,
			"Kategori masih dipakai produk — pindahkan atau hapus produknya dulu")
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		return helpers.InternalError(c, "Gagal menghapus kategori")
	}

	return helpers.OK(c, "Kategori berhasil dihapus", nil)
}
