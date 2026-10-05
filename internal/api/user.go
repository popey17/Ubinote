package api

import (
	"encoding/json"
	"net/http"
	"personal-note/internal/auth"
	"time"

	"github.com/google/uuid"
)

type request struct {
	Email    *string `json:"email"`
	Password *string `json:"password"`
}

type RegisterResponse struct {
	ID    uuid.UUID `json:"id"`
	Email string    `json:"email"`
}

type LoginRequest struct {
	Email    *string `json:"email"`
	Password *string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func (h *ApiHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if req.Email == nil || req.Password == nil {
		http.Error(w, "Fill required credential", http.StatusBadRequest)
		return
	}

	password, err := auth.Hashpassword(*req.Password)
	if err != nil {
		http.Error(w, "error hashing password", http.StatusInternalServerError)
		return
	}

	id, err := h.Store.CreateUser(r.Context(), *req.Email, password)

	if err != nil {
		http.Error(w, "email already existed", http.StatusConflict)
		return
	}

	response := RegisterResponse{
		ID:    id,
		Email: *req.Email,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *ApiHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if req.Email == nil || req.Password == nil {
		http.Error(w, "Fill required credential", http.StatusBadRequest)
		return
	}

	user, err := h.Store.GetUserByEmail(r.Context(), *req.Email)
	if err != nil {
		http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	if ok, _ := auth.CheckPassword(user.PasswordHash, *req.Password); !ok {
		http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	token, err := auth.CreateToken(user.ID, h.JWTSecret, 24*time.Hour)

	if err != nil {
		http.Error(w, "Invalid Token", http.StatusInternalServerError)
		return
	}

	setAuthCookie(w, token, h.Env)

	response := LoginResponse{
		Token: token,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

}

func (h *ApiHandler) Logout(w http.ResponseWriter, r *http.Request) {
	clearAuthCookie(w, h.Env)
	w.WriteHeader(http.StatusNoContent)
}

func (h *ApiHandler) Me(w http.ResponseWriter, r *http.Request) {
	id, ok := UserIdFromContext(r.Context())
	if !ok {
		http.Error(w, "error in reading the ID from token", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"user_id": id.String(),
	})
}
