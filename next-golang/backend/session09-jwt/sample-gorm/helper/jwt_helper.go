package helper

import (
	"os"
	"sample-gorm/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(user models.User) (string, error) {

	claims := &models.Claims{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "sample-gorm",
			Subject:   user.Email,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secretKey := []byte(os.Getenv("SECRET_KEY"))
	return token.SignedString(secretKey)
}
