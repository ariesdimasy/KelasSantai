package main

import (
	"fmt"
	"log"
	"rest-api-be06/handler"
	"rest-api-be06/model"

	"github.com/gofiber/fiber/v2"
)

func main() {

	app := fiber.New()

	// satu endpoint ("/") dengan method GET
	app.Get("/", func(c *fiber.Ctx) error {

		page := c.Query("page")
		limit := c.Query("limit")
		search := c.Query("search")

		return c.Status(200).JSON(fiber.Map{
			"message": "REST API golang with fiber",
			"query": fiber.Map{
				"page":   page,
				"limit":  limit,
				"search": search,
			},
		})
	})

	app.Post("/", func(c *fiber.Ctx) error {

		return c.Status(201).JSON(fiber.Map{
			"message": "data telah di tambahkan",
		})
	})

	api := app.Group("/api")
	v1 := api.Group("/v1")

	v1.Get("/products",
		func(c *fiber.Ctx) error {
			fmt.Println("Middleware executed")
			return c.Next()
		}, func(c *fiber.Ctx) error {

			return c.Status(201).JSON(fiber.Map{
				"message": "data product",
				"data": []model.Product{
					{
						Id:    1,
						Name:  "Keyboard logitech Mk120",
						Price: 120_000,
					},
					{
						Id:    2,
						Name:  "Mouse logitech B100",
						Price: 90_000,
					},
				},
			})
		})

	v1.Post("/products", handler.CreateProduct)
	// v1.Get("/products/:id", handler.GetProductDetail)
	v1.Get("/products/:id/:userId", handler.GetProductDetail)
	v1.Put("/products/:id", handler.UpdateProduct)
	v1.Delete("/products/:id", handler.DeleteProduct)

	log.Println("Server started on :8080")
	log.Fatal(app.Listen(":8080"))

}
