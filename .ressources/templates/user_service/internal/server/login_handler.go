package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"user/internal/models"
	"user/internal/utils"
)

// Login endpoint
func (server *Server) loginChallenge(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var t models.UsernameRequest
	err := decoder.Decode(&t)
	username := t.Username

	// Check if the user already exists in the database
	user, err := server.users.GetUser(username)
	if err != nil {
		fmt.Println("Try login challenge for user " + username)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	username = user.Email

	options, sessionData, err := server.webAuthn.BeginLogin(user)
	if err != nil {
		fmt.Printf("%v", err)
		http.Error(w, "Error creating login challenge", http.StatusInternalServerError)
		return
	}
	// Store session data in session store
	server.sessionDataStore[username] = sessionData
	utils.WriteJSON(w, options)
}

// Login verification endpoint
func (server *Server) login(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")

	// Retrieve the user from the database
	user, err := server.users.GetUser(username)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	// Retrieve session data for this user
	sessionData, exists := server.sessionDataStore[username]
	if !exists {
		http.Error(w, "Session data not found", http.StatusBadRequest)
		return
	}

	_, error := server.webAuthn.FinishLogin(user, *sessionData, r)
	if error != nil {
		http.Error(w, "Error verifying login", http.StatusUnauthorized)
		return
	}

	tokenString, err := utils.GenerateJWT(*user, server.getSigningKey())
	if err != nil {
		http.Error(w, "Error creating token", http.StatusInternalServerError)
		return
	}

	//set  the token in a cookie to prevent XSS attacks on client
	utils.SetJWTCookie(w, tokenString)
	w.WriteHeader(http.StatusOK)
	utils.WriteJSON(w, map[string]string{"ok": "true", "status": "success"})
}

// LoginUser authenticates the user with a password and returns a JWT token.
func (server *Server) loginPassword(w http.ResponseWriter, r *http.Request) {
	var creds models.PasswordCredentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Retrieve the user from the database
	user, err := server.users.GetUser(creds.Username)
	if err != nil {
		fmt.Println("User does not exist")
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Compare the password with the stored hash
	err = utils.CheckPassword(user.PasswordHash, creds.Password)
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	if !user.Enable2FA {
		// Generate a JWT token for the user
		token, err := utils.GenerateJWT(*user, server.getSigningKey())
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}

		// Return the token in the response
		utils.SetJWTCookie(w, token)

	} else {
		// generate a intermediate cookie, taht stores the user id and expires in10 minutes and send a redirect
		token, err := utils.Generate2FAToken(*user, server.getSigningKey())
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}
		fmt.Println("setting 2fa token")
		utils.Set2FACookie(w, token)
		http.Redirect(w, r, "/totp-verification", http.StatusSeeOther)
		return
	}
	utils.WriteJSON(w, map[string]string{"status": "success", "displayName": user.Name})
}

func (server *Server) ValidateTOTPLogin(w http.ResponseWriter, r *http.Request) {
	var token models.TOTPRequest
	err := json.NewDecoder(r.Body).Decode(&token)
	authToken, err := r.Cookie("auth_phase_token")
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error getting cookie", http.StatusUnauthorized)
		return
	}
	userID, err := utils.ValidateTempAuthToken(authToken.Value)
	fmt.Println(userID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Unauthorized access", http.StatusUnauthorized)
		return
	}

	// validate
	fmt.Println("validating the token")
	valid, err := server.users.Validate2FA(userID, token.Code)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error validating", http.StatusInternalServerError)
		return
	}
	if valid {
		user, _ := server.users.GetUserById(userID)
		// Generate a JWT token for the user
		token, err := utils.GenerateJWT(*user, server.getSigningKey())
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}

		// Return the token in the response
		utils.SetJWTCookie(w, token)
		utils.WriteJSON(w, map[string]string{"status": "success"})
		return
	}
	w.WriteHeader(http.StatusUnauthorized)
}

func logout(w http.ResponseWriter, r *http.Request) {
	// Clear the JWT cookie by setting it to an expired state
	utils.UnsetJWTCookie(w)

	// Optionally, if you're maintaining server-side sessions, invalidate the session here

	w.WriteHeader(http.StatusOK)

}

func (server *Server) generateLoginRoutes() {
	server.httpServer.HandleFunc("/auth/login/challenge", server.loginChallenge)
	server.httpServer.HandleFunc("/auth/login", server.login)
	server.httpServer.HandleFunc("/auth/validatetotp", server.ValidateTOTPLogin)
	server.httpServer.HandleFunc("/auth/login/password", server.loginPassword)
	server.httpServer.HandleFunc("/auth/logout", logout)
	server.httpServer.Handle("/auth/verify", CheckAuthMiddleware(http.HandlerFunc(verify)))
}

// Verify token endpoint (secured)
func verify(w http.ResponseWriter, r *http.Request) {
	// If the token is valid, send success response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Authenticated"))
}
