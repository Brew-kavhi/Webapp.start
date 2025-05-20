package models

// RegisterUserRequest represents the request body for registering a user
type RegisterUserRequest struct {
	Name     string `json:"name"`
	LastName string `json:"lastName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateUserRequest struct {
	Name     string `json:"name"`
	LastName string `json:"lastName"`
	Email    string `json:"email"`
}

type DeleteUserRequest struct {
	Password string `json:"password"`
}

type DisableTwoFARequest struct {
	Password string `json:"password"`
}

type UsernameRequest struct {
	Username string `json:"username"`
}

type TOTPRequest struct {
	Code string `json:"totp_code"`
}
