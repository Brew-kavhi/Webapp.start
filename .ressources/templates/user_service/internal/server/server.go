package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"user/internal/database"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/rs/cors"
)

type Server struct {
	users            *database.UserDB
	httpServer       *http.ServeMux
	cors             *cors.Cors
	sessionDataStore map[string]*webauthn.SessionData
	webAuthn         *webauthn.WebAuthn
	tokenDuration    int
}

func NewServer(userDB *database.UserDB, cors *cors.Cors, webauth *webauthn.WebAuthn) *Server {
	handler := http.NewServeMux()

	tokenDuration := 0
	var envTokenDuration, durationErr = strconv.ParseInt(os.Getenv("RESET_TOKEN_DURATION"), 10, 32)
	if durationErr == nil {
		tokenDuration = int(envTokenDuration)
	}

	server := &Server{
		users:            userDB,
		httpServer:       handler,
		cors:             cors,
		sessionDataStore: make(map[string]*webauthn.SessionData),
		webAuthn:         webauth,
		tokenDuration:    tokenDuration,
	}

	server.generateSecureUserRoutes()
	server.generateInsecureUserRoutes()

	server.generateLoginRoutes()

	server.generateRegisterRoutes()
	return server
}

func (server *Server) getSigningKey() []byte {
	return []byte(os.Getenv("JWT_SECRET"))
}

func (server *Server) Start() {
	log.Println("Server starting...")
	if err := http.ListenAndServe(":8080", SecureHeadersMiddleware(server.cors.Handler(server.httpServer))); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
