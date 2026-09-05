// middlewares/auth_middleware.go
//
// Tiga middleware autentikasi:
//
//	Protected() — wajib login. Token tidak ada/tidak valid -> 401.
//	AdminOnly() — wajib login DAN role admin. Bukan admin -> 403.
//	Optional()  — kalau ada token dipakai, kalau tidak ada request tetap lanjut.
//
// Bedanya 401 dan 403:
//
//	401 Unauthorized — "saya tidak tahu kamu siapa" (belum login)
//	403 Forbidden    — "saya tahu kamu siapa, tapi kamu tidak berhak"
package middlewares

import (
	"fiber-api/database"
	"fiber-api/helpers"
	"fiber-api/models"
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var JWT_SECRET = []byte(
	os.Getenv("JWT_SECRET"))

// middleware/auth.go

// membaca request dari user apakah token yang diberikan valid dan tidak expired ?
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// 1. Ambil header Authorization
		auth := c.Get("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			return c.Status(401).JSON(fiber.Map{
				"error": "Token diperlukan",
			})
		}

		// 2. Ekstrak token dari "Bearer xxx"
		tokenStr := strings.TrimPrefix(auth, "Bearer ")

		// 3. Parse & verifikasi token
		token, err := jwt.Parse(tokenStr,
			func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("signing method invalid")
				}
				return JWT_SECRET, nil
			})

		// 4. Cek valid dan tidak expired
		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{
				"error": "Token tidak valid atau expired",
			})
		}

		// 5. Simpan claims ke Locals
		claims := token.Claims.(jwt.MapClaims)
		c.Locals("user_id", uint(claims["user_id"].(float64)))
		c.Locals("user_role", claims["role"].(string))
		return c.Next()
	}
}

// Handler baca data dari Locals
func GetMe(c *fiber.Ctx) error {
	// Ambil user_id yang sudah diset middleware
	userID := c.Locals("user_id").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return helpers.NotFound(c, "User tidak ditemukan")
	}

	return helpers.OK(c, "Profil user", user)
}

// Contoh: middleware RequireRole
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("user_role").(string)
		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{
			"error": "Akses ditolak — tidak ada izin",
		})
	}
}

// Cara pakai di Postman:
// Headers → Authorization → Bearer <token>
// Atau: Auth tab → Bearer Token → paste token
