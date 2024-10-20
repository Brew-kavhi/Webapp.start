package main

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/go-webauthn/webauthn/webauthn"
)


// User struct represents a user in the system.
type User struct {
	ID          uint           `gorm:"primaryKey"`
	Name        string         `gorm:"size:100;not null;unique"`
	DisplayName string         `gorm:"size:100;not null"`
	Icon              string                `json:"icon,omitempty"`
	Credentials       DBCredentialSlice `gorm:"type:json"`
	Email    string `gorm:"uniqueIndex"`
	Password string
}

// DBCredential is a wrapper around webauthn.Credential
type DBCredential struct {
    webauthn.Credential // Embed the original Credential type
}

// Implement the Valuer interface for storing as JSON
func (c DBCredential) Value() (driver.Value, error) {
	fmt.Printf("%v", c)
    return json.Marshal(c) // Marshal the embedded Credential field
}

// Implement the Scanner interface for loading from JSON
func (c *DBCredential) Scan(value interface{}) error {
	fmt.Println("Scanning")
    bytes, ok := value.([]byte)
    if !ok {
        return fmt.Errorf("failed to unmarshal DBCredential value: %v", value)
    }
    return json.Unmarshal(bytes, c) // Unmarshal into the embedded Credential field
}
// If your field is a slice of DBCredential, you can implement this for the slice:
type DBCredentialSlice []DBCredential

// Value serializes the credential slice into JSON
func (c DBCredentialSlice) Value() (driver.Value, error) {
    return json.Marshal(c)
}
// If your field is a slice of DBCredential, implement this for the slice:
func (c *DBCredentialSlice) Scan(value interface{}) error {
    byteData, ok := value.([]byte)
    if !ok {
        return fmt.Errorf("failed to unmarshal DBCredentialSlice, got %T", value)
    }
    return json.Unmarshal(byteData, c)
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
