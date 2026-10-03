package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
}

func Load() (*config, error) {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbURL := os.Getenv("DB_URL")
	jwtSecret := os.Getenv("JWT_SECRET")

	if dbURL == "" {
		return nil, fmt.Errorf("DB_URL is required")
	}
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	conf := &config{
		Port:        port,
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
	}

	return conf, nil

}
