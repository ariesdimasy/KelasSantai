package helpers

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Konfigurasi upload image produk
const (
	// Ukuran maksimum file: 2 MB
	MaxImageSize = 2 * 1024 * 1024

	// Folder tempat menyimpan file (relatif terhadap root project)
	ProductImageDir = "uploads/products"

	// Prefix URL untuk mengakses file (lihat app.Static di index.go)
	UploadURLPrefix = "/uploads"
)

// allowedImageExt: ekstensi yang diizinkan -> content-type yang diharapkan
var allowedImageExt = map[string][]string{
	".jpg":  {"image/jpeg"},
	".jpeg": {"image/jpeg"},
	".png":  {"image/png"},
	".webp": {"image/webp"},
}

// ValidateImage memeriksa ekstensi, ukuran, dan isi file (magic bytes).
// Mengembalikan error dengan pesan yang siap dikirim ke client.
//
// Kenapa perlu cek magic bytes? Karena ekstensi & Content-Type dari client
// mudah dipalsukan — file .exe bisa di-rename jadi .jpg.
func ValidateImage(fh *multipart.FileHeader) error {
	// 1. Ukuran file
	if fh.Size == 0 {
		return fmt.Errorf("file kosong")
	}
	if fh.Size > MaxImageSize {
		return fmt.Errorf("ukuran file maksimal %d MB", MaxImageSize/(1024*1024))
	}

	// 2. Ekstensi harus ada di whitelist
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	expectedTypes, ok := allowedImageExt[ext]
	if !ok {
		return fmt.Errorf("format file tidak didukung, gunakan: jpg, jpeg, png, atau webp")
	}

	// 3. Baca 512 byte pertama untuk mendeteksi tipe file sebenarnya
	src, err := fh.Open()
	if err != nil {
		return fmt.Errorf("gagal membaca file")
	}
	defer src.Close()

	buf := make([]byte, 512)
	n, _ := src.Read(buf)
	detected := http.DetectContentType(buf[:n])

	for _, t := range expectedTypes {
		if strings.HasPrefix(detected, t) {
			return nil
		}
	}

	return fmt.Errorf("isi file bukan gambar yang valid (terdeteksi: %s)", detected)
}

// BuildImageFilename membuat nama file yang aman & unik.
// JANGAN pakai nama file dari client langsung — rawan path traversal
// (contoh: "../../index.go") dan bisa menimpa file lain.
//
// Hasil: "product_12_20260905_143012.jpg"
func BuildImageFilename(productID uint, originalName string) string {
	ext := strings.ToLower(filepath.Ext(originalName))
	return fmt.Sprintf("product_%d_%s%s",
		productID,
		time.Now().Format("20060102_150405"),
		ext,
	)
}

// EnsureUploadDir membuat folder upload bila belum ada.
func EnsureUploadDir(dir string) error {
	return os.MkdirAll(dir, 0o755)
}

// RemoveFileIfExists menghapus file lama dan mengabaikan error "file tidak ada".
// Dipakai saat mengganti/menghapus image supaya tidak ada file nyangkut (orphan).
func RemoveFileIfExists(path string) error {
	if path == "" {
		return nil
	}
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

// PublicImageURL mengubah path penyimpanan jadi URL yang bisa diakses client.
// "uploads/products/product_1.jpg" -> "/uploads/products/product_1.jpg"
func PublicImageURL(storedPath string) string {
	if storedPath == "" {
		return ""
	}
	return "/" + filepath.ToSlash(storedPath)
}
