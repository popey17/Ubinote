package api

import (
	"context"
	"errors"
	"net/http"
	"personal-note/internal/auth"
	"strings"
)

const authCookieName = "token"

func (h *ApiHandler) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := extractToken(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		id, err := auth.ValidateToken(token, h.JWTSecret)
		if err != nil {
			clearAuthCookie(w)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, id)
		next(w, r.WithContext(ctx))
	}
}

func extractToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		token, ok := strings.CutPrefix(authHeader, "Bearer ")
		if !ok || token == "" {
			return "", errors.New("invalid authorization header")
		}
		return token, nil
	}

	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			return "", errors.New("missing token")
		}
		return "", errors.New("failed to read cookie")
	}
	if cookie.Value == "" {
		return "", errors.New("missing token")
	}
	return cookie.Value, nil
}

func setAuthCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})
}

func clearAuthCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})
}
