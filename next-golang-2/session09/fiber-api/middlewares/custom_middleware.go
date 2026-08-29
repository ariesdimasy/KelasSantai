package middlewares

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func MyMiddleware(c *fiber.Ctx) error {
	fmt.Println("My middleware executed")
	err := c.Next() // jalankan next middleware/handler
	// kode SETELAH handler (response sudah dikirim)
	fmt.Println("My middleware after Next")
	return err
}
