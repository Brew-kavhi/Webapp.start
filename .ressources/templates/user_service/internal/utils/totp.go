package utils

import (
	"os"
	"user/internal/models"

	"github.com/pquerna/otp/totp"
)

func GenerateTOTPSecret(user *models.User) (string, string, error) {
	secret, err := totp.Generate(totp.GenerateOpts{
		Issuer:      os.Getenv("APP_URL"),
		AccountName: user.Email,
	})
	if err != nil {
		return "", "", err
	}
	return secret.Secret(), secret.URL(), nil
}

func VerifyTOTPCode(secret, code string) bool {
	return totp.Validate(code, secret)
}
