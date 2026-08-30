package database

import (
	"log"

	"fiber-api/models"
)

// seedCategories mengisi tabel categories dengan data awal.
//
// Sumber data: CreateProductRequest di models/product.go
// -> validate:"required,oneof=Electronic Fashion Kuliner"
//
// Idempotent: pakai FirstOrCreate berdasarkan slug (uniqueIndex),
// jadi aman dipanggil berkali-kali tanpa bikin duplikat.
func seedCategories() {
	categories := []models.Category{
		{
			Name:        "Electronic",
			Slug:        "electronic",
			Description: "Perangkat elektronik: gadget, komputer, dan aksesorisnya",
		},
		{
			Name:        "Fashion",
			Slug:        "fashion",
			Description: "Pakaian, sepatu, tas, dan aksesoris fashion",
		},
		{
			Name:        "Kuliner",
			Slug:        "kuliner",
			Description: "Makanan, minuman, dan produk kuliner lainnya",
		},
	}

	for _, c := range categories {
		result := DB.Where(models.Category{Slug: c.Slug}).FirstOrCreate(&c)
		if result.Error != nil {
			log.Printf("⚠️  Gagal seed kategori %q: %v", c.Name, result.Error)
			continue
		}
		if result.RowsAffected > 0 {
			log.Printf("🌱 Kategori dibuat: %s", c.Name)
		}
	}

	log.Println("✅ Seed categories selesai!")
}
