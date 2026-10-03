package api

import (
	"context"
	"net/http"
	"personal-note/internal/store"

	"github.com/google/uuid"
)

type contextKey string

const userIDKey contextKey = "userID"

type ApiHandler struct {
	Store     *store.Store
	JWTSecret string
}

func (h *ApiHandler) Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "ok"}`))
}

func UserIdFromContext(ctx context.Context) (uuid.UUID, bool) {
	id, ok := ctx.Value(userIDKey).(uuid.UUID)
	return id, ok
}
