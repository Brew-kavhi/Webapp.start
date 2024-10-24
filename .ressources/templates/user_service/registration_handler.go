package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func (userDB *UserDB) registerChallenge(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	
	// Check if the user already exists in the database
	user, err := userDB.GetUser(username)
	if err != nil {
		fmt.Println("Try register credentials for username" + username)
		http.Error(w, "User not found", http.StatusNotFound)
		return
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

func (userDB *UserDB) register(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")

	// Retrieve the user from the database
	user, err := userDB.GetUser(username)
	if err != nil {
		fmt.Println("Try register credentials for username" + username)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	// Retrieve session data for this user
	sessionData, exists := sessionDataStore[username]
	if !exists {
		http.Error(w, "Session data not found", http.StatusBadRequest)
		return
	}
	newCredential, err := webAuthn.FinishRegistration(user, *sessionData, r)
	if err != nil {
		http.Error(w, "Error verifying registration", http.StatusInternalServerError)
		return
	}

	user.Credentials = append(user.Credentials, DBCredential{*newCredential})

	// Save the credential in the database
	userDB.DB.Save(user)
	writeJSON(w, "Registration successful")
}

func (userDB *UserDB) registerPassword(w http.ResponseWriter, r *http.Request) {
	var creds PasswordCredentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Hash the password before storing it
	hashedPassword, err := HashPassword(creds.Password)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	var user User
	    user = User{
		Name:    creds.Username,
		DisplayName: creds.Username, // or get it from the request if available
		Email:       creds.Username + "@exmapl.ecom",       // get email from request if available
		PasswordHash: hashedPassword,
	    }
	userDB.AddUser(&user)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}
