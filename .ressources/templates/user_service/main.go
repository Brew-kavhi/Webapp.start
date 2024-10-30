package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"log" 
	"strconv"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

var webAuthn *webauthn.WebAuthn
var signingKey = []byte("") // Replace with a secure key
var tokenDuration = uint(5) // token duration in minutes
var userStore = map[string]*User{}
var sessionDataStore = map[string]*webauthn.SessionData{} // Store session data temporarily



// Verify token endpoint (secured)
func verify(w http.ResponseWriter, r *http.Request) {
	// If the token is valid, send success response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Authenticated"))
}

// Helper function to write JSON response
func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func main() {
	envErr := godotenv.Load("../../.env")
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	signingKey = []byte(os.Getenv("JWT_SECRET"))
	var envTokenDuration, durationErr = strconv.ParseInt(os.Getenv("RESET_TOKEN_DURATION"), 10, 32)
	if durationErr == nil {
		tokenDuration = uint(envTokenDuration)
	}
	var err error
	
	//userDB := &UserDB{DB: db}
	userDB := &UserDB{}
	userDB.InitConnection()

	// Auto-migrate the models
	userDB.AutoMigrate()

	webAuthn, err = webauthn.New(&webauthn.Config{
		RPDisplayName: "Coffee Web App", // Display Name for your site
		RPID:          "pwa.mariusgoehring.de",   // Your server domain name
RPOrigins:      []string{"https://homeserver:10001", "https://pwa.mariusgoehring.de"},
	})
	if err != nil {
		fmt.Println("Error initializing WebAuthn:", err)
	}

	handler := http.NewServeMux()
	handler.Handle("/auth/register/challenge", checkAuthMiddleware(http.HandlerFunc(userDB.registerChallenge)))
	handler.Handle("/auth/register", checkAuthMiddleware(http.HandlerFunc(userDB.register)))
	handler.HandleFunc("/auth/register/password", userDB.registerPassword)
	handler.HandleFunc("/auth/login/challenge", userDB.loginChallenge)
	handler.HandleFunc("/auth/login", userDB.login)
	handler.HandleFunc("/auth/login/password", userDB.loginPassword)
	handler.HandleFunc("/auth/logout", logout)
	handler.HandleFunc("/user/new", userDB.registerNewUser)
	handler.HandleFunc("/user/reset_password", userDB.resetPassword)
	handler.HandleFunc("/user/validatepasswordtoken", userDB.validatePasswordToken)
	handler.Handle("/user/update", checkAuthMiddleware(http.HandlerFunc(userDB.updateUser)))
	handler.Handle("/user/get", checkAuthMiddleware(http.HandlerFunc(userDB.getUser)))
	handler.Handle("/auth/verify", checkAuthMiddleware(http.HandlerFunc(verify)))
	handler.Handle("/user/delete", checkAuthMiddleware(http.HandlerFunc(userDB.deleteUser)))
	handler.Handle("/user/change_password", checkAuthMiddleware(http.HandlerFunc(userDB.resetPasswordUsingCredentials)))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("CORS_ORIGIN"), "http://localhost"}, // Allow your frontend
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"}, // Allow methods
		AllowedHeaders:   []string{"Authorization", "Content-Type"}, // Allow headers
		AllowCredentials: true, // Allow cookies, tokens
	})

	fmt.Println("Server starting...")
	if err := http.ListenAndServe(":10001", secureHeadersMiddleware(c.Handler(handler))); err != nil {
		fmt.Println("Error starting server:", err)
	}
}

