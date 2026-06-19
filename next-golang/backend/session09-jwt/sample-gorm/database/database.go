package database

import (
	"fmt"
	"log"
	"sample-gorm/models"
	"time"

	// "gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(dsn string) {

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		// Info : Tampilkan semua sql di terminal
		// Warn : Tampilkan semua error di terminal
		// Error : Tampilkan error saja
		// Silent : Tidak menampilkan apa-apa

	})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("failed to get sql.DB instance")
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db

	fmt.Println("Connected!")

}

func Migrate() {

	err := DB.AutoMigrate(&models.Category{}, &models.Product{}, &models.User{})

	if err != nil {
		log.Fatal("failed to migrate database")
	}

	log.Println("Migration completed")
}
