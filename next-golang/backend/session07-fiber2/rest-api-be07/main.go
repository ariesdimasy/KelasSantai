package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"rest-api-be07/handler"
)

func main() {

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {

			code := fiber.StatusInternalServerError
			msg := "Terjadi Kesalahan Internal"

			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
				msg = e.Message
			}

			// Log error 500 untuk debugging
			if code >= 500 {
				log.Printf("[ERROR] %s %s %d: %v",
					c.Method(), c.Path(), code, err)
			}

			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"error":   msg,
			})

		},
	})

	// middleware level application
	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
			// Kirim notifikasi ke Sentry/Slack
			log.Printf("PANIC: %v", e)
		},
	}))

	app.Use(logger.New())
	app.Use(cors.New()) // production tidak di sarankan

	// Production: spesifik
	// app.Use(cors.New(cors.Config{
	//     // Origin yang diizinkan
	//     AllowOrigins: "http://localhost:3001," +
	//                   "https://myapp.vercel.app",
	//     // Method yang diizinkan
	//     AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	//     // Header yang diizinkan
	//     AllowHeaders: "Content-Type,Authorization,X-API-Key",
	//     // Header yang boleh dibaca client
	//     ExposeHeaders: "X-Total-Count",
	//     // Izinkan cookies
	//     AllowCredentials: true,
	// }))

	api := app.Group("/api") // level router
	v1 := api.Group("/v1")   // level router

	v1.Get("/test", func(c *fiber.Ctx) error {
		panic("bug ditemukan!") // ← panic!
		return fiber.NewError(500, "error di enpoint ini")
	})

	// level handler
	v1.Get("/products", handler.GetProducts)
	v1.Post("/products", handler.CreateProduct)

	log.Println("Server started on :8080")
	log.Fatal(app.Listen(":8080"))
}
