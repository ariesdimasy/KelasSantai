package models

import (
	"gorm.io/gorm"
)

// model/category.go
type Category struct {
	gorm.Model
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"size:100;not null"`
	// uniqueIndex: slug tidak boleh duplikat
	Slug        string `json:"slug" gorm:"size:100;uniqueIndex"`
	Description string `json:"description" gorm:"type:text"`

	// Relasi: has many Products
	Products []Product `json:"products" gorm:"foreignKey:CategoryID"`
}

// --- DTO ---------------------------------------------------------------------
//
// Slug tidak ada di request: server yang menurunkannya dari Name
// (lihat helpers.Slugify) supaya bentuknya selalu konsisten.

type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description" validate:"omitempty,max=1000"`
}

// UpdateCategoryRequest: semua field opsional (partial update).
type UpdateCategoryRequest struct {
	Name string `json:"name" validate:"omitempty,min=3,max=100"`
	// pointer supaya bisa membedakan "tidak dikirim" (nil)
	// dari "dikirim string kosong" (mengosongkan deskripsi)
	Description *string `json:"description" validate:"omitempty,max=1000"`
}

// Hasil AutoMigrate di MySQL:
// CREATE TABLE categories (
//   id bigint unsigned AUTO_INCREMENT,
//   nama varchar(100) NOT NULL,
//   slug varchar(100) UNIQUE,
//   deskripsi text,
//   created_at datetime,
//   updated_at datetime,
//   PRIMARY KEY (id)
// );

// Tag gorm: yang paling sering:
// primaryKey, size:N, not null
// uniqueIndex, index, default:val
// type:text, foreignKey:ColName
