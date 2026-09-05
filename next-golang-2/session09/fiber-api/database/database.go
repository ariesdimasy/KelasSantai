package database

import (
	"fiber-api/models"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
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
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := getEnv("DB_NAME", "db_bootcamp_be08")
	dbSSLMode := getEnv("DB_SSLMODE", "disable") // "require" bila DB di cloud
	dbTimeZone := getEnv("DB_TIMEZONE", "Asia/Jakarta")

	// DSN: format koneksi PostgreSQL
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode, dbTimeZone,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
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

	log.Println("✅ Terhubung ke PostgreSQL!")

	migrate() // buat/ubah tabel + isi data awal
}

// database/database.go — jalankan setelah koneksi berhasil
func migrate() {
	err := DB.AutoMigrate(
		&models.Category{}, // CREATE TABLE categories (...)
		&models.Product{},  // CREATE TABLE products (...)
		&models.User{},
	)
	if err != nil {
		log.Fatal("AutoMigrate gagal:", err)
	}
	log.Println("✅ AutoMigrate selesai!")

	seedCategories() // isi data awal (idempotent, aman dipanggil ulang)
}
