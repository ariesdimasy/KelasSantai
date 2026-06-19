package main

import (
	"fmt"
	"log"
	"os"

	"sample-gorm/database"
	"sample-gorm/handler"
	"sample-gorm/middleware"

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

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	database.Connect(dsn)
	database.Migrate()

	app := fiber.New()

	api := app.Group("/api")
	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	api.Get("/categories", handler.GetCategories)
	api.Post("/categories", middleware.JWTMiddleware, middleware.IsAdminRole, handler.CreateCategory)
	api.Put("/categories/:id", middleware.JWTMiddleware, middleware.IsAdminRole, handler.UpdateCategory)
	api.Delete("/categories/:id", middleware.JWTMiddleware, middleware.IsAdminRole, handler.DeleteCategory)

	api.Get("/products", handler.GetProducts)
	api.Post("/products", middleware.JWTMiddleware, middleware.IsAdminRole, handler.CreateProduct)

	auth := api.Group("/auth")
	auth.Post("/register", handler.UserRegister)
	auth.Post("/login", handler.UserLogin)

	log.Println("Server is running on port ", os.Getenv("APP_PORT"))
	app.Listen(":" + os.Getenv("APP_PORT"))
}
