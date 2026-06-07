package handler

import (
	"rest-api-be07/helper"
	"rest-api-be07/model"
	"rest-api-be07/validator"

	"github.com/gofiber/fiber/v2"
)

func GetProducts(c *fiber.Ctx) error {
	products := []model.Product{
		{
			Id:    1,
			Name:  "Iphone 17 Promax",
			Price: 23_000_000,
		},
		{
			Id:    2,
			Name:  "Macbook Pro M5 16 inch",
			Price: 50_000_000,
		},
	}

	return helper.OK(c, "successfully get products", products)
}

func CreateProduct(c *fiber.Ctx) error {
	// Handler:
	var reqBody model.CreateProductRequest

	if err := c.BodyParser(&reqBody); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	if errs := validator.Validate(reqBody); errs != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Validasi gagal",
			"errors":  errs,
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "New data Product Insert",
		"data": fiber.Map{
			"Name":  "Motherboard Asus Aoruz B305",
			"price": 2_500_000,
		},
	})
}

func GetProductDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	userId := c.Params("userId")

	return c.Status(200).JSON(fiber.Map{
		"message": "success get detail product",
		"data": fiber.Map{
			"id":     id,
			"userId": userId,
		},
	})
}

func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var reqBody model.ProductRequest

	if err := c.BodyParser(&reqBody); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	if reqBody.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Nama harus diisi",
		})
	}

	if reqBody.Price == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Price harus diisi",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "success update detail product",
		"data": fiber.Map{
			"id":    id,
			"name":  reqBody.Name,
			"price": reqBody.Price,
		},
	})
}

func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	return c.Status(204).JSON(fiber.Map{
		"message": "success delete product",
		"data": fiber.Map{
			"id": id,
		},
	})
}
