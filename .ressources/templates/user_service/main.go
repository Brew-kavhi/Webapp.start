package main

import (
	"fmt"
	"os"
	"user/internal/database"
	"user/internal/server"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	envErr := godotenv.Load("../../.env")
	if envErr != nil {
		envErr = godotenv.Load(".env")
		if envErr != nil {
			fmt.Println("Error loading .env file")
		}
	}

	userDB := &database.UserDB{}
	userDB.InitConnection()

	// Auto-migrate the models
	userDB.AutoMigrate()

	webAuthn, err := webauthn.New(&webauthn.Config{
		RPDisplayName: "Coffee Web App",        // Display Name for your site
		RPID:          "pwa.mariusgoehring.de", // Your server domain name
		RPOrigins:     []string{"https://homeserver:10001", "https://pwa.mariusgoehring.de"},
	})
	if err != nil {
		fmt.Println("Error initializing WebAuthn:", err)
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("CORS_ORIGIN"), "http://localhost"}, // Allow your frontend
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},               // Allow methods
		AllowedHeaders:   []string{"Authorization", "Content-Type"},              // Allow headers
		AllowCredentials: true,                                                   // Allow cookies, tokens
	})

	server.NewServer(userDB, c, webAuthn)
}
