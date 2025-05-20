package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"
	"user/internal/models"
)

// GenerateResetToken creates a secure token for password reset
func GenerateResetToken() (string, error) {
	b := make([]byte, 32) // 256-bit token
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func VerifyResetToken(storedToken models.PasswordResetToken, token string) (bool, error) {
	if time.Now().After(storedToken.Expire) {
		return false, errors.New("expired reset token")
	}
	if token != storedToken.Token {
		return false, errors.New("invalid or expired reset token")
	}
	return true, nil
}
