package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

// DBCredential is a wrapper around webauthn.Credential
type DBCredential struct {
	webauthn.Credential // Embed the original Credential type
}

type PasswordCredentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type PasswordResetToken struct {
	ID     uint   `gorm:"autoIncrement,primaryKey"`
	UserID uint   `gorm:"not null"`
	Token  string `gorm:"not null"`
	Expire time.Time
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
