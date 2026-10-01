package main

import (
	"fmt"
	"log"
	"net/http"

	"personal-note/internal/api"
	"personal-note/internal/config"
	"personal-note/internal/database"
	"personal-note/internal/store"
)

func main() {
	fmt.Println("note api")
	cfg, _ := config.Load()

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

	// store := store.New(pool)
	// id, _, _ := store.CreateUser()
	// fmt.Println(id)

	mux.HandleFunc("GET /health", h.Health)
	mux.HandleFunc("POST /api/v1/auth/register", h.Register)
	mux.HandleFunc("POST /api/v1/auth/login", h.Login)

	log.Fatal(http.ListenAndServe(":"+cfg.Port, mux))
}
