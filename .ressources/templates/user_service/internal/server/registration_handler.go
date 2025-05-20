package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"user/internal/models"
	"user/internal/utils"
)

func (server *Server) registerChallenge(w http.ResponseWriter, r *http.Request) {
	// Check if the user already exists in the database
	userID := r.Context().Value("user_id")

	// next decode the body into a userEdit object.
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user, err := server.users.GetUserById(uint(userIDInt))
	if err != nil {
		fmt.Println("Try register credentials for username" + user.Name)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	username := user.Email
	options, sessionData, err := server.webAuthn.BeginRegistration(user)

	if err != nil {
		http.Error(w, "Error creating registration challenge", http.StatusInternalServerError)
		return
	}

	// Store sessionData temporarily (can be in memory or a persistent store like Redis)
	server.sessionDataStore[username] = sessionData
	utils.WriteJSON(w, options)
}

func (server *Server) register(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id")

	// next decode the body into a userEdit object.
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user, err := server.users.GetUserById(uint(userIDInt))

	if err != nil {
		fmt.Println("Try register credentials for username")
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	username := user.Email

	// Retrieve session data for this user
	sessionData, exists := server.sessionDataStore[username]
	if !exists {
		fmt.Println("notexist")
		http.Error(w, "Session data not found", http.StatusBadRequest)
		return
	}
	newCredential, err := server.webAuthn.FinishRegistration(user, *sessionData, r)
	if err != nil {
		http.Error(w, "Error verifying registration", http.StatusInternalServerError)
		return
	}

	user.Credentials = append(user.Credentials, models.DBCredential{*newCredential})

	// Save the credential in the database
	server.users.DB.Save(user)
	utils.WriteJSON(w, "Registration successful")
}

func (server *Server) registerPassword(w http.ResponseWriter, r *http.Request) {
	var creds models.PasswordCredentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Hash the password before storing it
	hashedPassword, err := utils.HashPassword(creds.Password)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	user := &models.User{
		Name:         creds.Username,
		DisplayName:  creds.Username,                  // or get it from the request if available
		Email:        creds.Username + "@exmapl.ecom", // get email from request if available
		PasswordHash: hashedPassword,
	}
	server.users.AddUser(user)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}

func (server *Server) generateRegisterRoutes() {
	server.httpServer.Handle("/auth/register/challenge", CheckAuthMiddleware(http.HandlerFunc(server.registerChallenge)))
	server.httpServer.Handle("/auth/register", CheckAuthMiddleware(http.HandlerFunc(server.register)))
	server.httpServer.HandleFunc("/auth/register/password", server.registerPassword)
}
