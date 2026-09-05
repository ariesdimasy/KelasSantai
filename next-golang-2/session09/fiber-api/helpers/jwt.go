package helpers

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	jwtIssuer = "fiber-api"

	// defaultJWTSecret hanya untuk development. Di production WAJIB diganti
	// lewat env JWT_SECRET, kalau tidak server akan menolak start.
	defaultJWTSecret = "fiber-api-dev-secret-ganti-di-production"

	// SessionCookie: nama cookie opsional untuk menyimpan token.
	// Server tetap menerima header "Authorization: Bearer <token>".
	SessionCookie = "fa_token"
)

var (
	jwtSecret []byte
	jwtTTL    time.Duration
	jwtOnce   sync.Once
)

// ErrInvalidToken: satu error untuk semua kasus token bermasalah
// (kedaluwarsa, signature salah, format ngawur). Client tidak perlu tahu
// detailnya — informasi itu justru membantu penyerang.
var ErrInvalidToken = errors.New("token tidak valid")

func envOr(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

// InitJWT membaca konfigurasi JWT dari environment.
// Panggil SETELAH database.Connect() (yang memuat file .env).
func InitJWT() {
	jwtOnce.Do(func() {
		secret := envOr("JWT_SECRET", defaultJWTSecret)

		if secret == defaultJWTSecret {
			if envOr("APP_ENV", "development") == "production" {
				log.Fatal("JWT_SECRET wajib diset di production (lihat .env.example)")
			}
			log.Println("⚠️  JWT_SECRET belum diset, memakai secret development")
		}

		// Default 7 hari. Token JWT tidak bisa dibatalkan sebelum kedaluwarsa,
		// jadi jangan bikin umurnya terlalu panjang.
		ttl, err := strconv.Atoi(envOr("JWT_TTL", "604800"))
		if err != nil || ttl <= 0 {
			ttl = 604800
		}

		jwtSecret = []byte(secret)
		jwtTTL = time.Duration(ttl) * time.Second

		log.Printf("✅ JWT siap (umur token: %s)", jwtTTL)
	})
}

// SessionClaims: isi token. RegisteredClaims menyediakan field standar
// (sub, exp, iat, iss) sesuai RFC 7519.
//
// Yang disimpan hanya data untuk identifikasi & tampilan. JANGAN simpan
// data rahasia di sini — payload JWT cuma base64, siapa pun bisa membacanya.
type SessionClaims struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// UserID mengambil user id dari claim "sub" (disimpan sebagai string).
func (c *SessionClaims) UserID() (uint, error) {
	id, err := strconv.ParseUint(c.Subject, 10, 64)
	if err != nil || id == 0 {
		return 0, ErrInvalidToken
	}
	return uint(id), nil
}

// GenerateToken membuat token HS256. Mengembalikan token dan umurnya (detik).
func GenerateToken(userID uint, name, email, role string) (string, int64, error) {
	InitJWT()

	now := time.Now()
	claims := SessionClaims{
		Name:  name,
		Email: email,
		Role:  role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   fmt.Sprintf("%d", userID),
			Issuer:    jwtIssuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(jwtTTL)),
		},
	}

	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).
		SignedString(jwtSecret)
	if err != nil {
		return "", 0, err
	}

	return signed, int64(jwtTTL.Seconds()), nil
}

// ParseToken memverifikasi signature + masa berlaku token.
//
// WithValidMethods penting: tanpa itu, penyerang bisa mengirim token
// dengan alg "none" dan lolos verifikasi.
func ParseToken(tokenString string) (*SessionClaims, error) {
	InitJWT()

	claims := &SessionClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims,
		func(t *jwt.Token) (interface{}, error) { return jwtSecret, nil },
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithIssuer(jwtIssuer),
		jwt.WithExpirationRequired(),
	)
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// BearerToken mengambil token dari header "Authorization: Bearer <token>".
// Mengembalikan "" bila header tidak ada atau formatnya salah.
func BearerToken(header string) string {
	const prefix = "bearer "
	if len(header) <= len(prefix) || !strings.EqualFold(header[:len(prefix)], prefix) {
		return ""
	}
	return strings.TrimSpace(header[len(prefix):])
}

// JWTTTL: umur token, dipakai saat menyetel cookie.
func JWTTTL() time.Duration {
	InitJWT()
	return jwtTTL
}
