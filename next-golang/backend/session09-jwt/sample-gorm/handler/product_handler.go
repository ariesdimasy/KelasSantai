package handler

import (
	"sample-gorm/database"
	"sample-gorm/models"

	"github.com/gofiber/fiber/v2"
)

func GetProducts(c *fiber.Ctx) error {
	var products []models.Product

	database.DB.Preload("Category").Find(&products)

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   products,
	})
}

func CreateProduct(c *fiber.Ctx) error {
	var productRequest models.ProductRequest

	err := c.BodyParser(&productRequest)
	if err != nil {
		return err
	}

	db_res := database.DB.Create(&models.Product{Name: productRequest.Name, Price: productRequest.Price, CategoryID: productRequest.CategoryID})
	if db_res.Error != nil {
		return db_res.Error
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   productRequest,
	})
}
