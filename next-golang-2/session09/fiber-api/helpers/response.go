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

func InternalError(c *fiber.Ctx, msg string) error {
	return c.Status(500).JSON(fiber.Map{
		"success": false,
		"error":   msg,
	})
}

// PaginationMeta: info paginasi yang dikirim bareng data list
type PaginationMeta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`       // total baris di DB (hasil COUNT)
	TotalPages int   `json:"total_pages"` // ceil(Total / Limit)
}

// OKWithMeta: response 200 untuk data list + meta paginasi.
//
// Pemakaian di handler:
//
//	return helpers.OKWithMeta(c, "Data produk", products,
//	    &helpers.PaginationMeta{Page: page, Limit: limit,
//	        Total: total, TotalPages: totalPages})
func OKWithMeta(c *fiber.Ctx, msg string, data interface{}, meta *PaginationMeta) error {
	return c.JSON(fiber.Map{
		"success": true,
		"message": msg,
		"data":    data,
		"meta":    meta,
	})
}

// Pemakaian di handler:
// return helper.OK(c, "Data ditemukan", products)
// return helper.NotFound(c, "Produk tidak ada")
