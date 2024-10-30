package main

import (
	"encoding/json"
	"net/http"
	"fmt"
	"strconv"
)

// RegisterUserRequest represents the request body for registering a user
type RegisterUserRequest struct {
	Name string `json:"name"`
	LastName string `json:"lastName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateUserRequest struct {
	Name string `json:"name"`
	LastName string `json:"lastName"`
	Email    string `json:"email"`
}


type DeleteUserRequest struct {
	Password string `json:"password"`
}

type GetUserResponse struct {
	Name string `json:"name"`
	LastName string `json:"lastName"`
	Email    string `json:"email"`
}

func (userDB *UserDB) registerNewUser(w http.ResponseWriter, r *http.Request) {
	var req RegisterUserRequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate the input
	if err := validateRegisterUserRequest(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create a new user
	user := User{
		Name: req.Name,
		LastName: req.LastName,
		DisplayName: req.Name + " " + req.LastName,
		Email:    req.Email,
		Icon: "",
		PasswordHash: hashedPassword,
	}

	// Save user to the database
	err = userDB.AddUser(&user)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})

}

func (userDB *UserDB) getUser(w http.ResponseWriter, r *http.Request) {
	// Function to edit a user. Here i need to retrieve the user from the cookie. also validate it.
	userID := r.Context().Value("user_id")

	// next decode the body into a userEdit object. 
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user, err := userDB.GetUserById(uint(userIDInt))
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	// encode user in the GetUserReponse object and return that
	response := GetUserResponse{
		Name: user.Name,
		LastName : user.LastName,
		Email: user.Email,
	}

	// Set header to application/json and encode the response as JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
}

func (userDB *UserDB) updateUser(w http.ResponseWriter, r *http.Request) {
	// Function to edit a user. Here i need to retrieve the user from the cookie. also validate it.
	userID := r.Context().Value("user_id")

	// next decode the body into a userEdit object. 
	var req UpdateUserRequest

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// save the user
	userIDInt, _ := strconv.ParseUint(userID.(string), 10, 32)
	user := &User{
		ID: uint(userIDInt),
		Name: req.Name,
		LastName: req.LastName,
		Email: req.Email,
	}
	err := userDB.UpdateUser(user)
	if err != nil {
		w.WriteHeader(500)
	}
	w.WriteHeader(http.StatusOK)
}

func (userDB *UserDB) deleteUser(w http.ResponseWriter, r *http.Request) {
	// Function to delete a user. Here i need to retrieve the user from the cookie. also validate it.
	var req DeleteUserRequest

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
	deleteErr := userDB.DeleteUser(uint(userIDInt), req.Password)
	if deleteErr != nil {
		http.Error(w, "Something went wrong with deletion", http.StatusInternalServerError)
	}
	unsetJWTCookie(w)
	w.WriteHeader(http.StatusOK)
}

func (userDB *UserDB) resetPassword(w http.ResponseWriter, r *http.Request) {
	// Function to reset a users password. If there is a credential stored for this user, prin a hint. that the user can just sign in using his credentials. Otherwise send a link for resetting.
	// get user by email.
	var req UsernameRequest
		
	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	user, err := userDB.GetUser(req.Username)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	token, tokenErr := GenerateResetToken()
	if tokenErr != nil {
		http.Error(w, "Failed to generate reset token", http.StatusInternalServerError)
		return
	}
	storeErr := userDB.StoreToken(user.ID, token)
	if storeErr != nil {
		http.Error(w, "Failed to store reset token", http.StatusInternalServerError)
		return
	}

	mailErr := SendEmailWithOAuth2(user.Email, token)
	if mailErr != nil {
		fmt.Printf("%v", mailErr)
		http.Error(w, "Failed to send mail", http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset link has been sent"))
}

func (userDB *UserDB) validatePasswordToken(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	var req PasswordCredentials
		
	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	user, err := userDB.GetUser(req.Username)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	storedToken, err := userDB.GetTokenForUser(user.ID)
	valid, err := VerifyResetToken(storedToken, token)
	if err != nil || !valid {
		fmt.Printf("%v", err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	hashedPassword, err := HashPassword(req.Password)
	user.PasswordHash = hashedPassword
	userDB.DB.Save(user)
	// then set password
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset link has been sent"))

}

func (userDB *UserDB) resetPasswordUsingCredentials(w http.ResponseWriter, r *http.Request) {
	// Function to reset a users password if user is logged in. This is for hte case that the user has credentials saved and the cookie is valid. then just reset the password in DB here.
	userID := r.Context().Value("user_id")
	fmt.Printf("%v", userID)
	// verify the cookie. That can only be 5 mins old.
	// If its older send a newLoginRequest.

	// Hash the password

	// Update the user

	// return a success response

}
