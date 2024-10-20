package main

import (
	"github.com/rs/cors"
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"github.com/golang-jwt/jwt"
	"github.com/go-webauthn/webauthn/webauthn"
)

var webAuthn *webauthn.WebAuthn
var signingKey = []byte("secret") // Replace with a secure key
var userStore = map[string]*User{}
var sessionDataStore = map[string]*webauthn.SessionData{} // Store session data temporarily
var db *gorm.DB



// Verify token endpoint (secured)
func verify(w http.ResponseWriter, r *http.Request) {
	tokenString := r.Header.Get("Authorization")[7:] // Remove "Bearer " prefix

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return signingKey, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	writeJSON(w, "Token is valid")
}

// Helper function to write JSON response
func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func main() {
	var err error
	db, err := gorm.Open(sqlite.Open("user.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

    // Auto-migrate the models
	db.AutoMigrate(&User{})
	webAuthn, err = webauthn.New(&webauthn.Config{
		RPDisplayName: "Coffee Web App", // Display Name for your site
		RPID:          "pwa.mariusgoehring.de",   // Your server domain name
RPOrigins:      []string{"https://homeserver:10001", "https://pwa.mariusgoehring.de"},
	})
	if err != nil {
		fmt.Println("Error initializing WebAuthn:", err)
	}

	handler := http.NewServeMux()
	handler.HandleFunc("/auth/register/challenge", registerChallenge)
	handler.HandleFunc("/auth/register", register)
	handler.HandleFunc("/auth/login/challenge", loginChallenge)
	handler.HandleFunc("/auth/login", login)
	handler.HandleFunc("/auth/verify", verify)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://homeserver:5173", "http://localhost", "http://homeserver:12001"}, // Allow your frontend
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"}, // Allow methods
        AllowedHeaders:   []string{"Authorization", "Content-Type"}, // Allow headers
        AllowCredentials: true, // Allow cookies, tokens
    })

	fmt.Println("Server starting...")
	if err := http.ListenAndServe(":10001", c.Handler(handler)); err != nil {
		fmt.Println("Error starting server:", err)
	}
}

