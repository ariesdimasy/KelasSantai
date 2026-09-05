package helpers

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

// bcryptCost: makin tinggi makin lambat (= makin sulit di-brute force).
// 10 = default library, 12 dipakai banyak aplikasi produksi.
// Jangan terlalu tinggi: setiap login ikut melambat.
const bcryptCost = 12

// bcryptMaxLen: bcrypt hanya memproses 72 byte pertama.
// Password lebih panjang bukan error, tapi sisanya diabaikan — jadi kita
// tolak lebih awal supaya tidak ada anggapan "password saya 100 karakter, aman".
const bcryptMaxLen = 72

var ErrPasswordTooLong = errors.New("password maksimal 72 karakter")

// HashPassword mengubah password asli menjadi hash bcrypt.
// Hash bcrypt sudah mengandung salt acak di dalamnya, jadi dua user
// dengan password sama akan punya hash yang BERBEDA.
func HashPassword(plain string) (string, error) {
	if len(plain) > bcryptMaxLen {
		return "", ErrPasswordTooLong
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPassword membandingkan password asli dengan hash di database.
//
// Perbandingannya TIDAK boleh pakai `==` pada hash: bcrypt melakukan
// constant-time compare supaya lama waktu proses tidak membocorkan
// seberapa banyak karakter yang benar (timing attack).
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
