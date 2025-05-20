package models

// Regi
type GetUserResponse struct {
	Name      string `json:"name"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Enable2FA bool   `json:"2faenabled"`
}
