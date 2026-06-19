package models

import "time"

type Product struct {
	ID         uint      `gorm:"primarykey"`
	Name       string    `gorm:"column:name;size:255;not null"`
	Price      float64   `gorm:"column:price;type:decimal(10,2);not null"`
	CategoryID uint      `gorm:"column:category_id;not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
	Category   Category  `gorm:"foreignKey:CategoryID;references:ID"`
}

type ProductRequest struct {
	Name       string  `gorm:"column:name;size:255;not null" json:"name"`
	Price      float64 `gorm:"column:price;type:decimal(10,2);not null" json:"price"`
	CategoryID uint    `gorm:"column:category_id;not null" json:"category_id"`
}
