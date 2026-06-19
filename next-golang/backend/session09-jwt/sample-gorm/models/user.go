package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type RoleEnum string

const (
	ADMIN RoleEnum = "admin"
	USER  RoleEnum = "user"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"unique;not null"`
	Password  string    `json:"password" gorm:"not null"`
	Role      RoleEnum  `json:"role" gorm:"type:varchar(10);not null;default:'user';check:role IN ('admin','user')"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime;type:timestamp"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime;type:timestamp"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserRegisterRequest struct {
	Name            string `json:"name" validate:"required"`
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=8"`
	Role            string `json:"role" validate:"required,oneof=admin user"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}

type UserLoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type Claims struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}
