package utils

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

func Set2FACookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_phase_token",
		Expires:  time.Now().Add(5 * time.Minute),
		Value:    token,
		HttpOnly: true,                    // Prevent access from JavaScript
		Secure:   true,                    // Only send over HTTPS
		Path:     "/",                     // Available to the entire site
		SameSite: http.SameSiteStrictMode, // CSRF protection
	})
}

func SetJWTCookie(w http.ResponseWriter, tokenString string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		HttpOnly: true,                    // Prevent access from JavaScript
		Secure:   true,                    // Only send over HTTPS
		Path:     "/",                     // Available to the entire site
		SameSite: http.SameSiteStrictMode, // CSRF protection
	})

}

func UnsetJWTCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour), // Expire the cookie
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func ValidateCookie(cookie *http.Cookie) (uint, error) {
	signingKey := []byte(os.Getenv("JWT_SECRET"))

	// Parse the JWT token
	tokenString := cookie.Value
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("No cookie found")
		}
		return signingKey, nil
	})

	if err != nil {
		fmt.Println("Error parsing token:", err)
		return 0, err
	}
	// Check if the token is valid
	if !token.Valid {
		return 0, errors.New("Cookie is invalid")
	}
	var userID uint
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if sub, ok := claims["sub"].(string); ok {
			userID64, err := strconv.ParseUint(sub, 10, 32)
			if err != nil {
				return 0, err
			}
			userID = uint(userID64)
		} else {
			return 0, errors.New("Error xconverting userID")
		}
	}
	return userID, nil
}
