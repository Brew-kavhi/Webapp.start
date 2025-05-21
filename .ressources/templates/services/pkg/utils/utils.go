package utils

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/golang-jwt/jwt/v4"
)

func ValidateCookie(cookie *http.Cookie, signingKey []byte) (uint, string, error) {
	// Parse the JWT token
	tokenString := cookie.Value
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("no cookie found")
		}
		return signingKey, nil
	})

	if err != nil {
		fmt.Println("Error parsing token:", err)
		return 0, "", err
	}
	// Check if the token is valid
	if !token.Valid {
		return 0, "", errors.New("cookie is invalid")
	}
	var userID uint
	var userEmail string
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		mailOk := false
		if userEmail, mailOk = claims["mail"].(string); !mailOk {
			return 0, "", errors.New("error converting userID")
		}
		if sub, ok := claims["sub"].(string); ok {
			userID64, err := strconv.ParseUint(sub, 10, 32)
			if err != nil {
				return 0, "", err
			}
			userID = uint(userID64)
		} else {
			return 0, "", errors.New("error converting userID")
		}
	}
	return userID, userEmail, nil
}

func Has(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}
