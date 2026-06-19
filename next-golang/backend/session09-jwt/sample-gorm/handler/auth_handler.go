package handler

import (
	"sample-gorm/database"
	"sample-gorm/helper"
	"sample-gorm/models"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func UserRegister(c *fiber.Ctx) error {
	var userRequest models.UserRegisterRequest

	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error json format",
			"data":   err,
		})
	}

	validate := validator.New()
	if err := validate.Struct(&userRequest); err != nil {
		return c.JSON(fiber.Map{
			"status": "error validation",
			"data":   helper.FormatValidationError(err),
		})
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(userRequest.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error hash",
			"data":   err.Error(),
		})
	}

	data := models.User{
		Name:     userRequest.Name,
		Email:    userRequest.Email,
		Password: string(hashPassword),
		Role:     models.RoleEnum(userRequest.Role),
	}

	if err := database.DB.Create(&data).Error; err != nil {
		return c.JSON(fiber.Map{
			"status": "error create",
			"data":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "Regiter success",
		"data": models.UserResponse{
			ID:        data.ID,
			Name:      data.Name,
			Email:     data.Email,
			CreatedAt: data.CreatedAt,
			UpdatedAt: data.UpdatedAt,
		},
	})
}

func UserLogin(c *fiber.Ctx) error {

	var userRequest models.UserLoginRequest
	var userData models.User

	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error json format",
			"data":   err,
		})
	}

	validate := validator.New()
	if err := validate.Struct(&userRequest); err != nil {
		return c.JSON(fiber.Map{
			"status": "error validation",
			"data":   helper.FormatValidationError(err),
		})
	}

	database.DB.Where("email = ?", userRequest.Email).First(&userData)

	if userData.Email == "" {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "Email or Password Invalid",
		})
	}

	if bcrypt.CompareHashAndPassword([]byte(userData.Password), []byte(userRequest.Password)) != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "Email or Password Invalid",
		})
	}

	token, err := helper.GenerateToken(userData)

	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"status": "Login Success",
		"data": fiber.Map{
			"user": models.UserResponse{
				ID:        userData.ID,
				Name:      userData.Name,
				Email:     userData.Email,
				CreatedAt: userData.CreatedAt,
				UpdatedAt: userData.UpdatedAt,
			},
			"token": token,
		},
	})
}
