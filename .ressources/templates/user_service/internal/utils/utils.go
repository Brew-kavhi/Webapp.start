package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"time"
	"user/internal/models"

	"strings"

	"github.com/golang-jwt/jwt/v4"
)

// OAuth2Auth structure to hold authentication details
type OAuth2Auth struct {
	username, accessToken string
}

// NewOAuth2Auth creates a new OAuth2Auth instance
func NewOAuth2Auth(username, accessToken string) *OAuth2Auth {
	return &OAuth2Auth{username, accessToken}
}

// Start starts the authentication process for OAuth2
func (a *OAuth2Auth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	if server.Name == "" {
		return "", nil, fmt.Errorf("SMTP server name required")
	}
	return "XOAUTH2", []byte("user=" + a.username + "\x01auth=Bearer " + a.accessToken + "\x01\x01"), nil
}

// Next is required to implement the Auth interface but is unused for OAuth2
func (a *OAuth2Auth) Next(fromServer []byte, more bool) ([]byte, error) {
	return nil, nil
}

// SendEmailWithOAuth2 uses net/smtp with OAuth2 authentication
func SendEmailWithOAuth2(to string, token string) error {
	port, err := strconv.ParseInt(os.Getenv("EMAIL_PORT"), 10, 32)
	if err != nil {
		fmt.Println("faliyre port")
		return err
	}
	smtpServer := os.Getenv("EMAIL_SMTP")
	smtpPort := int(port)
	from := os.Getenv("EMAIL_USER")
	subject := "Reset your password"
	body := "Hello,\nyou requested to reset your password. Click on <a href='" + os.Getenv("APP_URL") + "validatepasswordtoken?token=" + token + "&email=" + to + "'>this link</a> if it was you. Otherwise nothing more has to be done."
	accessToken := os.Getenv("EMAIL_PASSWORD")
	auth := NewOAuth2Auth(from, accessToken)
	fmt.Println(body)

	// Set up email message
	msg := bytes.Buffer{}
	msg.WriteString(fmt.Sprintf("From: %s\r\n", from))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", to))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/plain; charset=\"utf-8\"\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(body)

	// Connect to the SMTP server and send the email
	addr := fmt.Sprintf("%s:%d", smtpServer, smtpPort)
	return smtp.SendMail(addr, auth, from, strings.Split(to, ","), msg.Bytes())
}

func GenerateJWT(user models.User, signingKey []byte) (string, error) {
	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss":  "frontend_jwt_token_key",
		"sub":  fmt.Sprintf("%d", user.ID),
		"name": user.Name,
		"mail": user.Email,
		"exp":  time.Now().Add(time.Hour * 1).Unix(),
	})
	tokenString, err := token.SignedString(signingKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func Generate2FAToken(user models.User, signingKey []byte) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": fmt.Sprintf("%d", user.ID),
		"exp":    time.Now().Add(5 * time.Minute).Unix(),
	})

	// Sign the token with the secret key
	tokenString, err := token.SignedString(signingKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %v", err)
	}
	return tokenString, nil
}

// Validate the temporary auth token and extract the userID
func ValidateTempAuthToken(tokenString string) (uint, error) {
	signingKey := []byte(os.Getenv("JWT_SECRET"))

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure that the token's signing method is HMAC and matches our secret
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return signingKey, nil
	})
	if err != nil {
		return uint(0), fmt.Errorf("failed to parse token: %v", err)
	}

	// Validate token claims and retrieve the userID
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		_userID, ok := claims["userID"].(string)
		if !ok {
			fmt.Println(ok)
			return uint(0), fmt.Errorf("userID not found in token claims")
		}
		userID64, err := strconv.ParseUint(_userID, 10, 32)
		if err != nil {
			fmt.Println(err)
			return uint(0), err
		}
		userID := uint(userID64)
		return userID, nil
	}
	return uint(0), fmt.Errorf("invalid token or claims")
}

// validateRegisterUserRequest validates the user registration request
func ValidateRegisterUserRequest(req models.RegisterUserRequest) error {
	if req.Name == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		return fmt.Errorf("All fields are required")
	}
	// Additional validations (e.g., email format, password length) can be added here
	return nil
}

// Helper function to write JSON response
func WriteJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
