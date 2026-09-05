// handler/user.go
package handler

import (
	"errors"
	"fiber-api/database"
	"fiber-api/helpers"
	"fiber-api/models"
	"math"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetUsers: GET /api/v1/users — hanya admin (lihat index.go).
//
// Query params yang didukung:
//
//	?keyword=budi     cari di nama ATAU email
//	?role=admin       filter role (admin/user)
//	?is_active=false  filter akun aktif/nonaktif
//	?page=2&limit=20  paginasi
//
// Password TIDAK ikut ke response karena field-nya bertag `json:"-"`.
func GetUsers(c *fiber.Ctx) error {
	keyword := c.Query("keyword", "")
	role := c.Query("role", "")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	// Jaga nilai paginasi tetap masuk akal. Tanpa ini `?limit=0` bikin
	// pembagian totalPages jadi +Inf, dan `?limit=100000` bisa menarik
	// seluruh tabel dalam satu request.
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// Query dibangun bertahap sesuai filter yang dikirim client
	query := database.DB.Model(&models.User{})

	if keyword != "" {
		// ILIKE = LIKE case-insensitive (PostgreSQL).
		// Tanda kurung penting: tanpa itu, OR akan "menelan" filter lain
		// sehingga role/is_active tidak berlaku.
		pattern := "%" + keyword + "%"
		query = query.Where(
			database.DB.Where("name ILIKE ?", pattern).Or("email ILIKE ?", pattern),
		)
	}
	if role != "" {
		// Tolak nilai ngawur supaya client tidak mengira hasil kosong
		// itu "memang tidak ada data".
		if role != string(models.RoleAdmin) && role != string(models.RoleUser) {
			return helpers.BadRequest(c, "role hanya boleh 'admin' atau 'user'")
		}
		query = query.Where("role = ?", role)
	}
	// is_active sengaja dibaca manual: c.QueryBool tidak bisa membedakan
	// "tidak dikirim" dari "dikirim false".
	if raw := c.Query("is_active", ""); raw != "" {
		switch raw {
		case "true", "1":
			query = query.Where("is_active = ?", true)
		case "false", "0":
			query = query.Where("is_active = ?", false)
		default:
			return helpers.BadRequest(c, "is_active hanya boleh true atau false")
		}
	}

	// Hitung total DULU, sebelum Offset/Limit dipasang
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return helpers.InternalError(c, "Gagal menghitung data user")
	}

	var users []models.User
	offset := (page - 1) * limit
	if err := query.
		Order("id desc"). // terbaru dulu
		Offset(offset).
		Limit(limit).
		Find(&users).Error; err != nil {
		return helpers.InternalError(c, "Gagal mengambil data user")
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return helpers.OKWithMeta(c, "Data user", users,
		&helpers.PaginationMeta{Page: page, Limit: limit,
			Total: total, TotalPages: totalPages})
}

// GetUserByID: GET /api/v1/users/:id — hanya admin.
func GetUserByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return helpers.BadRequest(c, "ID harus berupa angka")
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return helpers.NotFound(c, "User tidak ditemukan")
		}
		return helpers.InternalError(c, "Gagal mengambil data user")
	}

	return helpers.OK(c, "Data ditemukan", user)
}
