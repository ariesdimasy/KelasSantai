// validator/validator.go
package validator

import (
	"fmt"
	"strings"
	"unicode"

	v10 "github.com/go-playground/validator/v10"
)

var validate = v10.New()

func Validate(s interface{}) map[string]string {
	if err := validate.Struct(s); err != nil {
		errs := make(map[string]string)
		for _, e := range err.(v10.ValidationErrors) {
			errs[toSnake(e.Field())] = toMsg(e)
		}
		return errs
	}
	return nil
}

// toSnake mengubah PascalCase/camelCase jadi snake_case.
// Contoh: "Nama" -> "nama", "HargaProduk" -> "harga_produk", "UserID" -> "user_id"
func toSnake(s string) string {
	runes := []rune(s)
	var b strings.Builder

	for i, r := range runes {
		if unicode.IsUpper(r) {
			if i > 0 {
				prev := runes[i-1]
				nextIsLower := i+1 < len(runes) && unicode.IsLower(runes[i+1])
				// sisipkan "_" saat transisi dari huruf kecil/angka ke huruf besar,
				// atau di akhir rangkaian acronym sebelum kata baru (mis. "UserID" -> "user_id")
				if unicode.IsLower(prev) || unicode.IsDigit(prev) || (unicode.IsUpper(prev) && nextIsLower) {
					b.WriteByte('_')
				}
			}
			b.WriteRune(unicode.ToLower(r))
		} else {
			b.WriteRune(r)
		}
	}

	return b.String()
}

func toMsg(e v10.FieldError) string {
	switch e.Tag() {
	case "required":
		return e.Field() + " wajib diisi"
	case "min":
		return fmt.Sprintf("min %s karakter", e.Param())
	case "max":
		return fmt.Sprintf("max %s karakter", e.Param())
	case "gt":
		return "harus lebih dari " + e.Param()
	case "gte":
		return "minimal " + e.Param()
	case "email":
		return "format email tidak valid"
	case "oneof":
		return "nilai tidak valid: " + e.Param()
	}
	return e.Tag()
}

// Handler:
// if errs := validator.Validate(req); errs != nil {
//     return c.Status(400).JSON(fiber.Map{
//         "success": false,
//         "error":   "Validasi gagal",
//         "errors":  errs,
//     })
// }
