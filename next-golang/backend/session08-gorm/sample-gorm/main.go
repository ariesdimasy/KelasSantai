package main

import (
	"fmt"
	"log"
	"os"

	"sample-gorm/database"
	"sample-gorm/handler"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

var DB *gorm.DB

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	database.Connect(dsn)
	database.Migrate()

	app := fiber.New()

	api := app.Group("/api")
	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	api.Get("/categories", handler.GetCategories)
	api.Post("/categories", handler.CreateCategory)
	api.Put("/categories/:id", handler.UpdateCategory)
	api.Delete("/categories/:id", handler.DeleteCategory)

	api.Get("/products", handler.GetProducts)
	api.Post("/products", handler.CreateProduct)

	log.Println("Server is running on port ", os.Getenv("APP_PORT"))
	app.Listen(":" + os.Getenv("APP_PORT"))
}
