package helper

import (
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// formatValidationErrors mengubah validator.ValidationErrors menjadi map
// field => pesan error yang mudah dibaca manusia.
func FormatValidationError(err error) fiber.Map {
	errors := fiber.Map{}
	for _, e := range err.(validator.ValidationErrors) {
		field := e.Field()
		switch e.Tag() {
		case "required":
			errors[field] = fmt.Sprintf("%s wajib diisi", field)
		case "email":
			errors[field] = fmt.Sprintf("%s harus berupa alamat email yang valid", field)
		case "min":
			errors[field] = fmt.Sprintf("%s minimal %s karakter", field, e.Param())
		case "max":
			errors[field] = fmt.Sprintf("%s maksimal %s karakter", field, e.Param())
		case "eqfield":
			errors[field] = fmt.Sprintf("%s harus sama dengan %s", field, e.Param())
		default:
			errors[field] = fmt.Sprintf("%s tidak valid (aturan: %s)", field, e.Tag())
		}
	}
	return errors
}
