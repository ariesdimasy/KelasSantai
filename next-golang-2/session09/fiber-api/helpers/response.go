package helpers

import "github.com/gofiber/fiber/v2"

func OK(c *fiber.Ctx, msg string, data interface{}) error {
	return c.JSON(fiber.Map{
		"success": true,
		"message": msg,
		"data":    data,
	})
}

func Created(c *fiber.Ctx, msg string, data interface{}) error {
	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": msg,
		"data":    data,
	})
}

func BadRequest(c *fiber.Ctx, msg string) error {
	return c.Status(400).JSON(fiber.Map{
		"success": false,
		"error":   msg,
	})
}

func NotFound(c *fiber.Ctx, msg string) error {
	return c.Status(404).JSON(fiber.Map{
		"success": false,
		"error":   msg,
	})
}

// Pemakaian di handler:
// return helper.OK(c, "Data ditemukan", products)
// return helper.NotFound(c, "Produk tidak ada")
