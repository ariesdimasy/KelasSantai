package models

import "time"

// Category represents the category table in the database
type Category struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Name      string    `gorm:"column:name;size:255;not null" json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Products  []Product `gorm:"foreignKey:CategoryID;references:ID" json:"products"`
}

type CategoryRequest struct {
	Name string `gorm:"column:name;size:255;not null" json:"name"`
}
