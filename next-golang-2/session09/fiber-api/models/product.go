package models

import (
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Name        string `json:"name" gorm:"size:200;not null"`
	Description string `json:"description" gorm:"type:text"`
	Price       int    `json:"price" gorm:"not null"`
	Stock       int    `json:"stock" gorm:"default:0"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	// Image: satu produk hanya boleh punya 1 image, jadi cukup 1 kolom
	// berisi path penyimpanan file (mis. "uploads/products/product_1_....jpg").
	// Kosong ("") berarti produk belum punya image.
	Image      string `json:"image" gorm:"size:255"`
	CategoryID uint   `json:"category_id" gorm:"not null;index"`
	// Relasi: belongs to Category
	Category *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
}

func (Product) TableName() string {
	return "products"
}

type CreateProductRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description" validate:"required,min=10,max=1000"`
	Price       int    `json:"price" validate:"required,gt=0"`
	Stock       int    `json:"stock" validate:"gte=0"` // greater than or equal
	// dikirim client sebagai "category": 1  -> id kategori
	CategoryID uint `json:"category" validate:"required"`
}

// UpdateProductRequest: partial update — semua field opsional.
// Pointer dipakai untuk angka & bool supaya "tidak dikirim" (nil) bisa
// dibedakan dari nilai nol yang memang disengaja (harga 0, stok 0, false).
type UpdateProductRequest struct {
	Name        string `json:"name" validate:"omitempty,min=3,max=100"`
	Description string `json:"description" validate:"omitempty,min=10,max=1000"`
	Price       *int   `json:"price" validate:"omitempty,gt=0"`
	Stock       *int   `json:"stock" validate:"omitempty,gte=0"`
	IsActive    *bool  `json:"is_active"`
	CategoryID  *uint  `json:"category"`
}

type CreateProductAndCategoryRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description" validate:"required,min=10,max=1000"`
	Price       int    `json:"price" validate:"required,gt=0"`
	Stock       int    `json:"stock" validate:"gte=0"` // greater than or equal
	// dikirim client sebagai "category": 1  -> id kategori
	Category string `json:"category" validate:"required"`
}
