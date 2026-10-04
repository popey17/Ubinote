package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	CorsOrigins []string
}

func parseCors(raw string) []string {
	defaults := []string{"http://localhost:5173"}
	if strings.TrimSpace(raw) == "" {
		return defaults
	}

	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if o := strings.TrimSpace(p); o != "" {
			origins = append(origins, o)
		}
	}
	if len(origins) == 0 {
		return defaults
	}
	return origins
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

	return &config{
		Port:        port,
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		CorsOrigins: parseCors(os.Getenv("CORS_ORIGIN")),
	}, nil
}
