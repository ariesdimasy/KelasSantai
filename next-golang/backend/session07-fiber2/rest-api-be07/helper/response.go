package helper

import "github.com/gofiber/fiber/v2"

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

type Meta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

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
