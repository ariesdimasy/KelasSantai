// handler/product.go
package handler

import (
	"fiber-api/models"
	"fiber-api/validator"

	"github.com/gofiber/fiber/v2"
)

// "database" sementara (slice)
var products = []models.Product{
	{ID: 1, Name: "Laptop ASUS",
		Price: 8500000, Stock: 15},
	{ID: 2, Name: "Mouse Logitech",
		Price: 250000, Stock: 50},
}
var nextID = 3

// GetProducts: GET /api/products
func GetProducts(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data":    products,
		"total":   len(products),
	})
}

// GetProductByID: GET /api/products/:id
func GetProductByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}
	for _, p := range products {
		if p.ID == uint(id) {
			return c.JSON(fiber.Map{"data": p})
		}
	}
	return c.Status(404).JSON(fiber.Map{
		"error": "Produk tidak ditemukan",
	})
}

func CreateProduct(c *fiber.Ctx) error {
	var req models.CreateProductRequest

	// Parse JSON body → struct
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	if errs := validator.Validate(req); errs != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Validasi gagal",
			"errors":  errs,
		})
	}

	// Sukses → 201 Created
	return c.Status(201).JSON(models.APIResponse{
		Success: true,
		Message: "Data Created",
		Data:    req,
	})
}
