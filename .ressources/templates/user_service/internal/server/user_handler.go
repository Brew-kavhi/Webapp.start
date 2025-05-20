package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"user/internal/models"
	"user/internal/utils"
)

func (server *Server) registerNewUser(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterUserRequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate the input
	if err := utils.ValidateRegisterUserRequest(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create a new user
	user := models.User{
		Name:         req.Name,
		LastName:     req.LastName,
		DisplayName:  req.Name + " " + req.LastName,
		Email:        req.Email,
		Icon:         "",
		PasswordHash: hashedPassword,
	}

	// Save user to the database
	err = server.users.AddUser(&user)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})

}

func (server *Server) getUser(w http.ResponseWriter, r *http.Request) {
	// Function to edit a user. Here i need to retrieve the user from the cookie. also validate it.
	userID := r.Context().Value("user_id")

	// next decode the body into a userEdit object.
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user, err := server.users.GetUserById(uint(userIDInt))
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	// encode user in the GetUserReponse object and return that
	response := models.GetUserResponse{
		Name:      user.Name,
		LastName:  user.LastName,
		Email:     user.Email,
		Enable2FA: user.Enable2FA,
	}

	// Set header to application/json and encode the response as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (server *Server) updateUser(w http.ResponseWriter, r *http.Request) {
	// Function to edit a user. Here i need to retrieve the user from the cookie. also validate it.
	userID := r.Context().Value("user_id")

	// next decode the body into a userEdit object.
	var req models.UpdateUserRequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// save the user
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user := &models.User{
		ID:       uint(userIDInt),
		Name:     req.Name,
		LastName: req.LastName,
		Email:    req.Email,
	}
	err := server.users.UpdateUser(user)
	if err != nil {
		w.WriteHeader(500)
	}
	w.WriteHeader(http.StatusOK)
}

func (server *Server) deleteUser(w http.ResponseWriter, r *http.Request) {
	// Function to delete a user. Here i need to retrieve the user from the cookie. also validate it.
	var req models.DeleteUserRequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate the input
	if req.Password == "" {
		http.Error(w, "Not authenticated", http.StatusUnauthorized)
		return
	}

	userID := r.Context().Value("user_id")
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	deleteErr := server.users.DeleteUser(uint(userIDInt), req.Password)
	if deleteErr != nil {
		http.Error(w, "Something went wrong with deletion", http.StatusInternalServerError)
	}
	utils.UnsetJWTCookie(w)
	w.WriteHeader(http.StatusOK)
}

func (server *Server) resetPassword(w http.ResponseWriter, r *http.Request) {
	// Function to reset a users password. If there is a credential stored for this user, prin a hint. that the user can just sign in using his credentials. Otherwise send a link for resetting.
	// get user by email.
	var req models.UsernameRequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	user, err := server.users.GetUser(req.Username)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	token, tokenErr := utils.GenerateResetToken()
	if tokenErr != nil {
		http.Error(w, "Failed to generate reset token", http.StatusInternalServerError)
		return
	}
	storeErr := server.users.StoreToken(user.ID, token, server.tokenDuration)
	if storeErr != nil {
		http.Error(w, "Failed to store reset token", http.StatusInternalServerError)
		return
	}

	mailErr := utils.SendEmailWithOAuth2(user.Email, token)
	if mailErr != nil {
		fmt.Printf("%v", mailErr)
		http.Error(w, "Failed to send mail", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset link has been sent"))
}

func (server *Server) validatePasswordToken(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	var req models.PasswordCredentials

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	user, err := server.users.GetUser(req.Username)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	storedToken, err := server.users.GetTokenForUser(user.ID)
	valid, err := utils.VerifyResetToken(storedToken, token)
	if err != nil || !valid {
		fmt.Printf("%v", err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	hashedPassword, err := utils.HashPassword(req.Password)
	user.PasswordHash = hashedPassword
	server.users.DB.Save(user)
	// then set password
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset link has been sent"))

}

func (server *Server) resetPasswordUsingCredentials(w http.ResponseWriter, r *http.Request) {
	// Function to reset a users password if user is logged in. This is for hte case that the user has credentials saved and the cookie is valid. then just reset the password in DB here.
	userID := r.Context().Value("user_id")
	fmt.Printf("%v", userID)
	// verify the cookie. That can only be 5 mins old.
	// If its older send a newLoginRequest.

	// Hash the password

	// Update the user

	// return a success response

}

func (server *Server) Enable2FAForUser(w http.ResponseWriter, r *http.Request) {
	// get user id from cookie
	userID := r.Context().Value("user_id")

	// next get user from id
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user, err := server.users.GetUserById(uint(userIDInt))
	if err != nil {
		fmt.Println(err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	// generate the token
	secret, url, err := utils.GenerateTOTPSecret(user)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error generating second factor", http.StatusInternalServerError)
		return
	}

	// store the secret in the database
	user.SecondFactor = secret
	user.Enable2FA = true
	server.users.DB.Save(user)

	w.WriteHeader(http.StatusCreated)
	utils.WriteJSON(w, map[string]string{"url": url})
}

func (server *Server) Disable2FAForUser(w http.ResponseWriter, r *http.Request) {
	var req models.DisableTwoFARequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// get user id from cookie
	userID := r.Context().Value("user_id")

	// next get user from id
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user, err := server.users.GetUserById(uint(userIDInt))
	if err != nil {
		fmt.Println(err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// checkPasswords
	passwordErr := utils.CheckPassword(user.PasswordHash, req.Password)
	if passwordErr != nil {
		http.Error(w, "Wrong password", http.StatusUnauthorized)
		return
	}

	// update the user
	user.SecondFactor = ""
	user.Enable2FA = false
	server.users.DB.Save(user)

	w.WriteHeader(http.StatusOK)
	utils.WriteJSON(w, map[string]string{"status": "success"})
}

func (server *Server) generateSecureUserRoutes() {
	server.httpServer.Handle("/user/disabletwofactor", CheckAuthMiddleware(http.HandlerFunc(server.Disable2FAForUser)))
	server.httpServer.Handle("/user/secondfactor", CheckAuthMiddleware(http.HandlerFunc(server.Enable2FAForUser)))
	server.httpServer.Handle("/user/update", CheckAuthMiddleware(http.HandlerFunc(server.updateUser)))
	server.httpServer.Handle("/user/get", CheckAuthMiddleware(http.HandlerFunc(server.getUser)))
	server.httpServer.Handle("/user/delete", CheckAuthMiddleware(http.HandlerFunc(server.deleteUser)))
	server.httpServer.Handle("/user/change_password", CheckAuthMiddleware(http.HandlerFunc(server.resetPasswordUsingCredentials)))
}

func (server *Server) generateInsecureUserRoutes() {
	server.httpServer.HandleFunc("/user/new", server.registerNewUser)
	server.httpServer.HandleFunc("/user/reset_password", server.resetPassword)
	server.httpServer.HandleFunc("/user/validatepasswordtoken", server.validatePasswordToken)

}
