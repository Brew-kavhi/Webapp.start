package main

import (
	//"encoding/base64"
	"fmt"
	"net/http"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	//"github.com/go-webauthn/webauthn/webauthn"
)

// Registration endpoint
func registerChallenge(w http.ResponseWriter, r *http.Request) {
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
		    user = User{
			Name:    username,
			DisplayName: username, // or get it from the request if available
			Email:       username + "@exmapl.ecom",       // get email from request if available
		    }
		    db.Create(&user)
			fmt.Println("user is stored in DB")
		} else {
		    http.Error(w, "Database error", http.StatusInternalServerError)
		    return
		}
	} else {
		fmt.Println("User already exists")
	}

	options, sessionData, err := webAuthn.BeginRegistration(user)

	if err != nil {
		http.Error(w, "Error creating registration challenge", http.StatusInternalServerError)
		return
	}

	// Store sessionData temporarily (can be in memory or a persistent store like Redis)
	sessionDataStore[username] = sessionData
	writeJSON(w, options)
}

// Registration verification endpoint
func register(w http.ResponseWriter, r *http.Request) {
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
	
	fmt.Println("user found")
	// Retrieve session data for this user
	sessionData, exists := sessionDataStore[username]
	if !exists {
		http.Error(w, "Session data not found", http.StatusBadRequest)
		return
	}
	newCredential, err := webAuthn.FinishRegistration(user, *sessionData, r)
	if err != nil {
		fmt.Printf("%v", err)
		http.Error(w, "Error verifying registration", http.StatusInternalServerError)
		return
	}

	user.Credentials = append(user.Credentials, DBCredential{*newCredential})

	// Save the credential in the database
	fmt.Printf("%v", user.Credentials)
	db.Save(user)
	fmt.Printf("%v", user.Credentials)
	fmt.Printf("%v", newCredential)
	writeJSON(w, "Registration successful")
}
