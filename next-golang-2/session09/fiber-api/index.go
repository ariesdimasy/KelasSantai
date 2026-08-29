// main.go — Hello World Server
package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	handler "fiber-api/handlers"
	"fiber-api/middlewares"
)

// Cara kirim response JSON
// c.JSON(data)                    // 200 OK
// c.Status(201).JSON(data)        // 201 Created
// c.Status(204).SendString("")    // 204 No Content
// c.Status(400).JSON(fiber.Map{"error": "..."})
// c.Status(404).JSON(fiber.Map{"error": "..."})
// c.Status(500).JSON(fiber.Map{"error": "..."})

// Sukses
// return c.JSON(Response{
//   Success: true, Message: "OK", Data: products,
// })
// // Error
// return c.Status(404).JSON(Response{
//   Success: false, Error: "Tidak ditemukan",
// })

func main() {
	// Buat instance Fiber
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			msg := "Terjadi kesalahan internal"

			// Cek apakah ini fiber.Error
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

	// middleware application level
	app.Use(recover.New()) // 1. Tangkap panic DULU (paling luar)

	// Custom handler saat panic / PRODUCTION SETTING
	// app.Use(recover.New(recover.Config{
	// 	EnableStackTrace: true,
	// 	StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
	// 		// Kirim notifikasi ke Sentry/Slack
	// 		log.Printf("PANIC: %v", e)
	// 	},
	// }))

	app.Use(logger.New()) // 2. Log setiap request
	app.Use(cors.New())   // 3. Handle CORS preflight

	// untuk production setting
	// app.Use(cors.New(cors.Config{
	// 	// Origin yang diizinkan
	// 	// berisi list url frontend,
	// 	AllowOrigins: "http://localhost:3001," +
	// 		"https://myapp.vercel.app",
	// 	// Method yang diizinkan
	// 	AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	// 	// Header yang diizinkan
	// 	// kalau disebut X-API-Key maka si API consumer harus menyertakan X-Api-Key nya
	// 	AllowHeaders: "Content-Type,Authorization,X-API-Key",
	// 	// Header yang boleh dibaca client
	// 	ExposeHeaders: "X-Total-Count",
	// 	// Izinkan cookies
	// 	AllowCredentials: true,
	// }))

	app.Use(limiter.New()) // 4. Rate limiting
	//app.Use(AuthMiddleware) // 5. Cek autentikasi

	// Route Group — prefix bersama
	api := app.Group("/api") // semua route prefix /api
	v1 := api.Group("/v1")   // /api/v1

	products := v1.Group("/products")
	products.Get("/", handler.GetProducts)       // /api/v1/products
	products.Get("/:id", handler.GetProductByID) // /api/v1/products/1
	products.Post("/", handler.CreateProduct)

	// Middleware pada group
	// admin := api.Group("/admin", AuthMiddleware) // middleware level router group
	//admin.Get("/users", GetAllUsers)   // hanya admin yang bisa akses!

	// Route pertama!
	// path / url
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, Fiber!")
	})

	app.Post("/welcome", middlewares.MyMiddleware, func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "OK",
			"message": "Request has been added to server!",
		})
	})

	// Route JSON
	app.Get("/api/status", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "running",
			"version": "1.0.0",
			"message": "BE-06 REST API!",
		})
	})

	// Multi-param
	// GET /api/users/5/posts/3
	app.Get("/api/users/:uid/posts/:pid",
		func(c *fiber.Ctx) error {
			uid := c.Params("uid") // "5"
			pid := c.Params("pid") // "3"
			return c.JSON(fiber.Map{
				"user": uid, "post": pid,
			})
		},
	)

	// Start server port 3000
	app.Listen(":3000")
}
