package main

import (
	"rest-api-be06/models"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "success",
		})
	})

	app.Get("/api/status", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "running",
			"version": "1.0.0",
			"message": "BE-06 REST API!",
		})
	})

	app.Post("/products", func(c *fiber.Ctx) error {
		var req models.CreateProductRequest

		return c.JSON(fiber.Map{
			"req": req,
		})
	})

	app.Listen(":3000")
}
