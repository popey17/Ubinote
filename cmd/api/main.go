package main

import (
	"fmt"
	"log"
	"net/http"

	"personal-note/internal/api"
	"personal-note/internal/config"
	"personal-note/internal/database"
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

	// store := store.New(pool)
	// id, _, _ := store.CreateUser()
	// fmt.Println(id)

	mux.HandleFunc("GET /health", api.Health)

	log.Fatal(http.ListenAndServe(":"+cfg.Port, mux))
}
