package middleware

import (
	"fmt"
	"os"
	"sample-gorm/models"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware(c *fiber.Ctx) error {

	tokenHeader := c.Get("Authorization")
	if tokenHeader == "" {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "Authorization header is required",
		})
	}

	token := strings.Split(tokenHeader, " ")[1]
	if token == "" {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "token not found",
		})
	}

	claims := &models.Claims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET_KEY")), nil
	})

	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "invalid token",
		})
	}

	return c.Next()
}

func IsAdminRole(c *fiber.Ctx) error {
	tokenHeader := c.Get("Authorization")
	token := strings.Split(tokenHeader, " ")[1]

	claims := &models.Claims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET_KEY")), nil
	})

	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "invalid token",
		})
	}

	fmt.Println(claims.Role)
	if claims.Role != "admin" {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "unauthorized",
		})
	}

	return c.Next()
}
