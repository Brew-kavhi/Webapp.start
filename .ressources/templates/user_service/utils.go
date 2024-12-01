package main

import (
	"bytes"
	"time"
	"os"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"net/http"
	"net/smtp"

	"strings"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"github.com/pquerna/otp/totp"
)

// HashPassword hashes a plain password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword compares a hashed password with a plain password.
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateResetToken creates a secure token for password reset
func GenerateResetToken() (string, error) {
    b := make([]byte, 32) // 256-bit token
    _, err := rand.Read(b)
    if err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}

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
	from :=  os.Getenv("EMAIL_USER")
	subject := "Reset your password"
	body :="Hello,\nyou requested to reset your password. Click on <a href='" + os.Getenv("APP_URL") + "validatepasswordtoken?token=" + token + "&email=" + to +"'>this link</a> if it was you. Otherwise nothing more has to be done."
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

func VerifyResetToken(storedToken PasswordResetToken, token string) (bool, error) {
	if time.Now().After(storedToken.Expire){
		return false, errors.New("expired reset token")
	}
	if token != storedToken.Token {
		return false, errors.New("invalid or expired reset token")
	}
	return true, nil
}
func GenerateTOTPSecret(user *User) (string, string, error) {
	secret, err := totp.Generate(totp.GenerateOpts{
		Issuer: "PWA.MARIUSFGOEHRIN.de", //os.Getenv("APP_URL"),
		AccountName: user.Email,
	})
	if err != nil {
		return "", "", err
	}
	return secret.Secret(), secret.URL(), nil
}

func VerifyTOTPCode(secret, code string) bool {
	return totp.Validate(code, secret)
}

func GenerateJWT(user User) (string, error) {
	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": "frontend_jwt_token_key",
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

func Generate2FAToken(user User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": fmt.Sprintf("%d",user.ID),
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
			fmt.Println( ok)
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

func validateCookie(cookie *http.Cookie) (uint, error) {
	// Parse the JWT token
	tokenString := cookie.Value
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		    return nil, errors.New("No cookie found")
		}
		return signingKey, nil
	})

	if err != nil {
		fmt.Println("Error parsing token:", err)
		return 0, err
	}
	// Check if the token is valid
	if !token.Valid {
		return 0, errors.New("Cookie is invalid")
	}
	var userID uint
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if _userID, ok := claims["sub"].(string); ok {
			userID64, err := strconv.ParseUint(_userID, 10, 32)
			if err != nil {
				return 0, err
			}
			userID = uint(userID64)
		} else {
			return 0, errors.New("Error xconverting userID")
		}
	}
	return userID, nil
}

func Set2FACookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
	    Name:     "auth_phase_token",
		Expires: time.Now().Add(5* time.Minute),
	    Value:    token,
	    HttpOnly: true,  // Prevent access from JavaScript
	    Secure:   true,  // Only send over HTTPS
	    Path:     "/",   // Available to the entire site
	    SameSite: http.SameSiteStrictMode,  // CSRF protection
	})
}

func setJWTCookie(w http.ResponseWriter, tokenString string) {
	http.SetCookie(w, &http.Cookie{
	    Name:     "jwt",
	    Value:    tokenString,
	    HttpOnly: true,  // Prevent access from JavaScript
	    Secure:   true,  // Only send over HTTPS
	    Path:     "/",   // Available to the entire site
	    SameSite: http.SameSiteStrictMode,  // CSRF protection
	})

}

func unsetJWTCookie(w http.ResponseWriter) {
    http.SetCookie(w, &http.Cookie{
        Name:     "jwt",
        Value:    "",
        Path:     "/",
        Expires:  time.Now().Add(-1 * time.Hour), // Expire the cookie
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteLaxMode,
    })
}

// validateRegisterUserRequest validates the user registration request
func validateRegisterUserRequest(req RegisterUserRequest) error {
	if req.Name == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		return fmt.Errorf("All fields are required")
	}
	// Additional validations (e.g., email format, password length) can be added here
	return nil
}
