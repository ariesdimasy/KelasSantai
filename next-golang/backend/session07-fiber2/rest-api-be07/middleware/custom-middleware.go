package middleware

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := fmt.Sprintf("%d", time.Now().UnixNano())
		c.Set("X-Request-ID", id)
		c.Locals("request_id", id)
		return c.Next()
	}
}

// buat identitas setiap client yang mengakses api
func APIKeyAuth(c *fiber.Ctx) error {
	key := c.Get("X-API-Key")
	if key == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "X-API-Key header diperlukan",
		})
	}
	if key != "secret-key-123" {
		return c.Status(403).JSON(fiber.Map{
			"error": "API key tidak valid",
		})
	}

}
