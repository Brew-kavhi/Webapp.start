package main

import (
	"net/http"
	"time"
	"fmt"
	"github.com/golang-jwt/jwt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Login endpoint
func loginChallenge(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	
	// Check if the user already exists in the database
	var user User
	db, err := gorm.Open(sqlite.Open("user.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	
	if err := db.Where("name = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
		    // User does not exist, so create a new one
			fmt.Printf("%v", err)
			http.Error(w, "Error cannot register user here", http.StatusInternalServerError)
		} else {
			fmt.Printf("%v", err)
		    http.Error(w, "Database error", http.StatusInternalServerError)
		    return
		}
	} else {
		fmt.Println("User already exists")
	}
	
	options, sessionData, err := webAuthn.BeginLogin(user)
	if err != nil {
		fmt.Printf("%v", err)
		http.Error(w, "Error creating login challenge", http.StatusInternalServerError)
		return
	}
	// Store session data in session store
	sessionDataStore[username] = sessionData
	writeJSON(w, options)
}

// Login verification endpoint
func login(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")

	db, err := gorm.Open(sqlite.Open("user.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
    
	// Retrieve the user from the database
	var user User
	if err := db.Where("name = ?", username).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	fmt.Println("Fuiond user")
	fmt.Printf("%v", user)
	
	// Retrieve session data for this user
	sessionData, exists := sessionDataStore[username]
	if !exists {
		http.Error(w, "Session data not found", http.StatusBadRequest)
		return
	}

	_, error := webAuthn.FinishLogin(user, *sessionData, r)
	if error != nil {
		http.Error(w, "Error verifying login", http.StatusUnauthorized)
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": "frontend_jwt_token_key",
		"sub":  user.ID,
		"name": user.Name,
		"exp":  time.Now().Add(time.Hour * 1).Unix(),
	})
	tokenString, err := token.SignedString(signingKey)
	if err != nil {
		http.Error(w, "Error creating token", http.StatusInternalServerError)
		return
	}

	//set  the token in a cookie to prevent XSS attacks on client
	http.SetCookie(w, &http.Cookie{
	    Name:     "jwt",
	    Value:    tokenString,
	    HttpOnly: true,  // Prevent access from JavaScript
	    Secure:   true,  // Only send over HTTPS
	    Path:     "/",   // Available to the entire site
	    SameSite: http.SameSiteStrictMode,  // CSRF protection
	})

	writeJSON(w, map[string]string{"status": "success"})
}
