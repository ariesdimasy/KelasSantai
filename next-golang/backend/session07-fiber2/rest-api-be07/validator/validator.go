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

func toSnake(s string) string {
	if s == "" {
		return ""
	}
	var b strings.Builder
	for i, r := range s {
		if unicode.IsUpper(r) {
			if i > 0 {
				b.WriteByte('_')
			}
			b.WriteRune(unicode.ToLower(r))
			continue
		}
		b.WriteRune(r)
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
