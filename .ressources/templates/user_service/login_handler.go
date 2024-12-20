package main

import (
	"encoding/json"
	"net/http"
	"fmt"
)

type UsernameRequest struct {
	Username string `json:"username"`
}

type TOTPRequest struct {
	Code string `json:"totp_code"`
}

// Login endpoint
func (userDB *UserDB) loginChallenge(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var t UsernameRequest
	err := decoder.Decode(&t)
	username := t.Username
	
	// Check if the user already exists in the database
	user, err := userDB.GetUser(username)
	if err != nil {
		fmt.Println("Try login challenge for user " + username)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	username = user.Email
	
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
func (userDB *UserDB) login(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")

	// Retrieve the user from the database
	user, err := userDB.GetUser(username)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}
	
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

	tokenString, err := GenerateJWT(*user)
	if err != nil {
		http.Error(w, "Error creating token", http.StatusInternalServerError)
		return
	}

	//set  the token in a cookie to prevent XSS attacks on client
	setJWTCookie(w, tokenString)
	w.WriteHeader(http.StatusOK)
	writeJSON(w, map[string]string{"ok": "true", "status": "success"})
}

// LoginUser authenticates the user with a password and returns a JWT token.
func (userDB *UserDB) loginPassword(w http.ResponseWriter, r *http.Request) {
	var creds PasswordCredentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Retrieve the user from the database
	user, err := userDB.GetUser(creds.Username)
	if err != nil {
		fmt.Println("User does not exist")
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Compare the password with the stored hash
	err = CheckPassword(user.PasswordHash, creds.Password)
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	if !user.Enable2FA {
		// Generate a JWT token for the user
		token, err := GenerateJWT(*user)
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}

		// Return the token in the response
		setJWTCookie(w, token)

	} else {
		// generate a intermediate cookie, taht stores the user id and expires in10 minutes and send a redirect 
		token, err := Generate2FAToken(*user)
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}
		fmt.Println("setting 2fa token")
		Set2FACookie(w, token)
		http.Redirect(w,r,"/totp-verification", http.StatusSeeOther)
		return
	}
	writeJSON(w, map[string]string{"status": "success", "displayName": user.Name})
}

func (userDB *UserDB) ValidateTOTPLogin(w http.ResponseWriter, r *http.Request) {
	var token TOTPRequest
	err := json.NewDecoder(r.Body).Decode(&token)
	authToken, err := r.Cookie("auth_phase_token")
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error getting cookie", http.StatusUnauthorized)
		return
	}
	userID, err :=ValidateTempAuthToken(authToken.Value)
	fmt.Println(userID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Unauthorized access", http.StatusUnauthorized)
		return
	}

	// validate
	fmt.Println("validating the token")
	valid, err := userDB.Validate2FA(userID, token.Code)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error validating", http.StatusInternalServerError)
		return
	}
	if valid {
		user, _ := userDB.GetUserById(userID)
		// Generate a JWT token for the user
		token, err := GenerateJWT(*user)
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}

		// Return the token in the response
		setJWTCookie(w, token)
		writeJSON(w, map[string]string{"status": "success"})
		return
	}
	w.WriteHeader(http.StatusUnauthorized)
}

func logout(w http.ResponseWriter, r *http.Request) {
	// Clear the JWT cookie by setting it to an expired state
	unsetJWTCookie(w)

    // Optionally, if you're maintaining server-side sessions, invalidate the session here

    w.WriteHeader(http.StatusOK)

}
