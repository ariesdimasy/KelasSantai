package models

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

// Role: tipe khusus supaya nilai role tidak bisa sembarangan diisi string.
// Bandingkan: user.Role == models.RoleAdmin  (aman, dicek compiler)
// vs         user.Role == "admni"            (typo, lolos compiler)
type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

// User — model standar GORM.
//
// Catatan penting soal keamanan:
//   - Password disimpan sebagai HASH bcrypt, bukan teks asli.
//   - Tag `json:"-"` membuat field Password TIDAK PERNAH ikut ke response JSON,
//     jadi model ini aman dikirim langsung ke client.
//
// Catatan soal soft delete:
// gorm.Model membawa DeletedAt, jadi Delete() hanya menandai baris (soft delete).
// Karena email punya uniqueIndex, email milik user yang sudah dihapus TETAP
// terpakai di index. Handler create/update karena itu mengecek dengan Unscoped()
// agar bisa memberi pesan error yang jelas (lihat handlers/user_handler.go).
type User struct {
	gorm.Model
	Name  string `json:"name" gorm:"size:100;not null"`
	Email string `json:"email" gorm:"size:150;not null;uniqueIndex"`
	// Password: hash bcrypt (60 karakter), bukan password asli
	Password string `json:"-" gorm:"size:255;not null"`
	Role     Role   `json:"role" gorm:"type:varchar(20);not null;default:user;index"`
	// IsActive: false = akun dinonaktifkan, tidak boleh login
	IsActive    bool       `json:"is_active" gorm:"default:true"`
	LastLoginAt *time.Time `json:"last_login_at"` // pointer -> boleh NULL (belum pernah login)
}

func (User) TableName() string {
	return "users"
}

// BeforeSave: hook GORM yang jalan sebelum INSERT/UPDATE.
// Email dinormalisasi (trim + huruf kecil) supaya "Budi@Mail.com" dan
// "budi@mail.com" dianggap SAMA oleh uniqueIndex.
func (u *User) BeforeSave(tx *gorm.DB) error {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
	u.Name = strings.TrimSpace(u.Name)
	if u.Role == "" {
		u.Role = RoleUser
	}
	return nil
}

// IsAdmin: helper kecil supaya pengecekan role hanya ditulis di satu tempat.
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// --- DTO (Data Transfer Object) ---------------------------------------------
//
// Struct request dipisah dari model supaya client TIDAK bisa mengisi field
// sensitif. Kalau BodyParser(&user) langsung ke model, penyerang cukup kirim
// {"role":"admin"} saat register untuk jadi admin.

// RegisterRequest: registrasi publik. Role SENGAJA tidak ada di sini —
// user baru selalu jadi RoleUser.
type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=3,max=100"`
	Email    string `json:"email" validate:"required,email,max=150"`
	Password string `json:"password" validate:"required,min=6,max=72"` // bcrypt max 72 byte
	// Opsional: kalau dikirim, harus sama dengan Password
	ConfirmPassword string `json:"confirm_password" validate:"omitempty,eqfield=Password"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// CreateUserRequest: dipakai admin di user management — role bisa dipilih.
type CreateUserRequest struct {
	Name     string `json:"name" validate:"required,min=3,max=100"`
	Email    string `json:"email" validate:"required,email,max=150"`
	Password string `json:"password" validate:"required,min=6,max=72"`
	Role     Role   `json:"role" validate:"required,oneof=admin user"`
}

// UpdateUserRequest: semua field opsional (partial update).
// Password kosong = tidak diganti.
type UpdateUserRequest struct {
	Name     string `json:"name" validate:"omitempty,min=3,max=100"`
	Email    string `json:"email" validate:"omitempty,email,max=150"`
	Password string `json:"password" validate:"omitempty,min=6,max=72"`
	Role     Role   `json:"role" validate:"omitempty,oneof=admin user"`
	// pointer supaya bisa membedakan "tidak dikirim" (nil) dari "dikirim false"
	IsActive *bool `json:"is_active"`
}

// UpdateProfileRequest: user mengubah datanya sendiri.
// Tidak ada Role & IsActive — kalau ada, user biasa bisa mengangkat
// dirinya sendiri jadi admin lewat endpoint ini.
type UpdateProfileRequest struct {
	Name  string `json:"name" validate:"required,min=3,max=100"`
	Email string `json:"email" validate:"required,email,max=150"`
}

// ChangePasswordRequest: ganti password sendiri.
// CurrentPassword wajib — supaya orang yang "pinjam" browser korban
// tidak bisa mengganti password tanpa tahu password lama.
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6,max=72,nefield=CurrentPassword"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=NewPassword"`
}

// AuthResponse: bentuk response login/register.
type AuthResponse struct {
	Token     string `json:"token"`
	TokenType string `json:"token_type"` // "Bearer"
	ExpiresIn int64  `json:"expires_in"` // detik
	User      *User  `json:"user"`
}
