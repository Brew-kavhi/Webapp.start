package middleware

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"{{MODULE}}/pkg/utils"
)

func checkAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("jwt")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		userID, userEmail, cookieInvalid := utils.ValidateCookie(cookie, []byte(os.Getenv("JWT_SECRET")))
		if cookieInvalid != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		// Store the user ID in the request context
		ctx := context.WithValue(r.Context(), "user_id", fmt.Sprint(userID))
		ctx = context.WithValue(ctx, "user_email", userEmail)

		// Pass the context to the next handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// secureHeadersMiddleware adds two basic security headers to each HTTP response
// X-XSS-Protection: 1; mode-block can help to prevent XSS attacks
// X-Frame-Options: deny can help to prevent clickjacking attacks
func SecureHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-XSS-Protection", "1; mode-block")
		w.Header().Set("X-Frame-Options", "deny")

		next.ServeHTTP(w, r)
	})
}
