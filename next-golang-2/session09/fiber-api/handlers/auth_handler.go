package handler

import (
	"fiber-api/database"
	"fiber-api/helpers"
	"fiber-api/models"
	"fiber-api/validator"
	"time"

	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// handler/auth.go
func Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return helpers.BadRequest(c, "JSON tidak valid")
	}
	// Validasi gagal = kesalahan client (400), bukan kesalahan server (500).
	// Kirim detail `errors` supaya client tahu field mana yang salah.
	if errs := validator.Validate(req); errs != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Validasi gagal",
			"errors":  errs,
		})
	}

	// Cek email duplikat
	var count int64
	database.DB.Model(&models.User{}).
		Where("email = ?", req.Email).Count(&count)
	if count > 0 {
		return helpers.Conflict(c, "Email sudah terdaftar")
	}

	// ConfirmPassword opsional (tag `omitempty`), jadi hanya dicek bila dikirim.
	// Tanpa penjagaan ini, request yang tidak mengirim confirm_password
	// selalu gagal karena "" != password.
	if req.ConfirmPassword != "" && req.Password != req.ConfirmPassword {
		return helpers.BadRequest(c, "Password dan ConfirmPassword tidak sama")
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return helpers.InternalError(c, "Gagal proses password")
	}

	// Simpan ke MODEL, bukan ke DTO. CreateUserRequest bukan tabel —
	// GORM akan menebak tabel "create_user_requests" yang tidak ada,
	// jadi tidak ada baris yang tersimpan.
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashed),
		Role:     models.RoleUser, // registrasi publik selalu user biasa
		IsActive: true,
	}
	if err := database.DB.Create(&user).Error; err != nil {
		return helpers.InternalError(c, "Gagal menyimpan user")
	}

	// user.Password tidak ikut karena json:"-"
	return helpers.Created(c, "Registrasi berhasil", user)
}

// handler/auth.go — Login
func Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	c.BodyParser(&req)

	// Cari user by email
	var user models.User
	err := database.DB.
		Where("email = ?", req.Email).
		First(&user).Error
	if err != nil {
		// Sama untuk "email tidak ada" dan "password salah"
		// agar hacker tidak tahu mana yang benar
		return helpers.Unauthorized(c,
			"Email atau password salah 1")
	}

	// Verifikasi password vs hash
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(req.Password))
	if err != nil {
		return helpers.Unauthorized(c,
			"Email atau password salah 2")
	}

	// Generate JWT
	token, _ := generateToken(user)

	return helpers.OK(c, "Login berhasil", fiber.Map{
		"access_token": token,
		"token_type":   "Bearer",
		"user":         user,
	})
}

// Fungsi generate JWT token
var JWT_SECRET = []byte(
	os.Getenv("JWT_SECRET"))

func generateToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		// exp: expired 24 jam dari sekarang
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256, claims)
	return token.SignedString(JWT_SECRET)
}

// Response sukses login:
// {
//   "success": true,
//   "message": "Login berhasil",
//   "data": {
//     "access_token": "eyJhbGci...",
//     "token_type": "Bearer",
//     "user": {
//       "id": 1,
//       "nama": "Budi",
//       "email": "budi@mail.com",
//       "role": "user"
//     }
//   }
// }
