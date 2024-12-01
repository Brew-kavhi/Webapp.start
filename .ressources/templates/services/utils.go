
package main

import (
	"errors"
	"fmt"
	"strconv"
	"net/http"
	"github.com/golang-jwt/jwt/v4"
)

func validateCookie(cookie *http.Cookie) (uint, string, error) {
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
		return 0, "", err
	}
	// Check if the token is valid
	if !token.Valid {
		return 0, "", errors.New("Cookie is invalid")
	}
	var userID uint
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		mailOk := false
		if userEmail, mailOk = claims["mail"].(string); !mailOk {
			return 0, "", errors.New("Error xconverting userID")
		}
		if _userID, ok := claims["sub"].(string); ok {
			userID64, err := strconv.ParseUint(_userID, 10, 32)
			if err != nil {
				return 0, "", err
			}
			userID = uint(userID64)
		} else {
			return 0, "", errors.New("Error xconverting userID")
		}
	}
	return userID, userEmail, nil
}

func Has(a string, list []string) bool {
	for _,b := range list {
		if b == a {
			return true;
		}
	}
	return false
}
