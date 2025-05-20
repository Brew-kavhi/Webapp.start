package models

import (
	"fmt"

	"github.com/go-webauthn/webauthn/webauthn"
)

// User struct represents a user in the system.
type User struct {
	ID           uint              `gorm:"autoIncrement,primaryKey"`
	Name         string            `gorm:"size:100;not null"`
	LastName     string            `gorm:"size:100;not null;default:''"`
	DisplayName  string            `gorm:"size:100;not null"`
	Icon         string            `json:"icon,omitempty"`
	Credentials  DBCredentialSlice `gorm:"type:json"`
	Email        string            `gorm:"uniqueIndex"`
	PasswordHash string
	Enable2FA    bool `gorm:"default:false"`
	SecondFactor string
}

// Implement WebAuthnID method (User ID)
func (u User) WebAuthnID() []byte {
	return []byte(fmt.Sprintf("%d", u.ID))
}

// Implement WebAuthnName method (Username)
func (u User) WebAuthnName() string {
	return u.Name
}

// Implement WebAuthnDisplayName method (User display name)
func (u User) WebAuthnDisplayName() string {
	return u.DisplayName
}

// Implement WebAuthnIcon method (User avatar URL, optional)
func (u User) WebAuthnIcon() string {
	return u.Icon
}

// Implement WebAuthnCredentials method (Return user's credentials)
func (u User) WebAuthnCredentials() []webauthn.Credential {
	var creds []webauthn.Credential
	for _, cred := range u.Credentials {
		creds = append(creds, cred.Credential) // Access the embedded field
	}
	return creds
}
