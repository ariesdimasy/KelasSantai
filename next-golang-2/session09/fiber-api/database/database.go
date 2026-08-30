package database

import (
	"fiber-api/models"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// getEnv mengambil nilai dari environment variable,
// atau mengembalikan fallback bila variabel tidak diset.
func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

func Connect() {
	// Muat file .env (abaikan error bila file tidak ada,
	// misalnya saat env sudah diset lewat sistem/container)
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️  File .env tidak ditemukan, memakai environment variable sistem")
	}

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := getEnv("DB_NAME", "db_bootcamp_be08")

	// DSN: format koneksi MySQL
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		// Info: tampilkan semua SQL di terminal
		// Error: hanya error (untuk production)
	})
	if err != nil {
		log.Fatal("Gagal koneksi:", err)
	}

	// Connection pool
	sqlDB, _ := DB.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("✅ Terhubung ke MySQL!")

	migrate() // buat/ubah tabel + isi data awal
}

// database/database.go — jalankan setelah koneksi berhasil
func migrate() {
	err := DB.AutoMigrate(
		&models.Category{}, // CREATE TABLE categories (...)
		&models.Product{},  // CREATE TABLE products (...)
	)
	if err != nil {
		log.Fatal("AutoMigrate gagal:", err)
	}
	log.Println("✅ AutoMigrate selesai!")

	seedCategories() // isi data awal (idempotent, aman dipanggil ulang)
}
