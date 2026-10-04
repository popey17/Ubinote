package api

import (
	"net/http"
	"slices"
)

func isAllowed(origin string, allowed []string) bool {
	return slices.Contains(allowed, origin)
}

func (h *ApiHandler) Cors(next http.Handler, allowed []string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestOrigin := r.Header.Get("Origin")
		if requestOrigin != "" && isAllowed(requestOrigin, allowed) {
			w.Header().Set("Access-Control-Allow-Origin", requestOrigin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
