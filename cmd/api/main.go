package main

import (
	"log"
	"net/http"

	"personal-note/internal/api"
	"personal-note/internal/config"
	"personal-note/internal/database"
	"personal-note/internal/store"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	pool, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}

	defer pool.Close()

	s := store.New(pool)

	h := &api.ApiHandler{
		Store:     s,
		JWTSecret: cfg.JWTSecret,
	}

	mux.HandleFunc("GET /health", h.Health)

	// user
	mux.HandleFunc("GET /api/v1/me", h.AuthMiddleware(h.Me))
	mux.HandleFunc("POST /api/v1/auth/register", h.Register)
	mux.HandleFunc("POST /api/v1/auth/login", h.Login)
	mux.HandleFunc("POST /api/v1/auth/logout", h.Logout)

	// note
	mux.HandleFunc("POST /api/v1/notes", h.AuthMiddleware(h.CreateNote))
	mux.HandleFunc("GET /api/v1/notes", h.AuthMiddleware(h.ListNotes))
	mux.HandleFunc("GET /api/v1/notes/{id}", h.AuthMiddleware(h.GetNote))
	mux.HandleFunc("PUT /api/v1/notes/{id}", h.AuthMiddleware(h.UpdateNote))
	mux.HandleFunc("DELETE /api/v1/notes/{id}", h.AuthMiddleware(h.DeleteNote))

	handler := h.Cors(mux, cfg.CorsOrigins)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, handler))
}
