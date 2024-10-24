package main

import (
	"time"
	"errors"
	"fmt"
	"strconv"
	"net/http"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a plain password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword compares a hashed password with a plain password.
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func GenerateJWT(user User) (string, error) {
	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": "frontend_jwt_token_key",
		"sub":  fmt.Sprintf("%d", user.ID),
		"name": user.Name,
		"exp":  time.Now().Add(time.Hour * 1).Unix(),
	})
	tokenString, err := token.SignedString(signingKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func validateCookie(cookie *http.Cookie) (uint, error) {
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
		if _userID, ok := claims["sub"].(string); ok {
			userID64, err := strconv.ParseUint(_userID, 10, 32)
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

func setJWTCookie(w http.ResponseWriter, tokenString string) {
	http.SetCookie(w, &http.Cookie{
	    Name:     "jwt",
	    Value:    tokenString,
	    HttpOnly: true,  // Prevent access from JavaScript
	    Secure:   true,  // Only send over HTTPS
	    Path:     "/",   // Available to the entire site
	    SameSite: http.SameSiteStrictMode,  // CSRF protection
	})

}

func unsetJWTCookie(w http.ResponseWriter) {
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

// validateRegisterUserRequest validates the user registration request
func validateRegisterUserRequest(req RegisterUserRequest) error {
	if req.Name == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		return fmt.Errorf("All fields are required")
	}
	// Additional validations (e.g., email format, password length) can be added here
	return nil
}
