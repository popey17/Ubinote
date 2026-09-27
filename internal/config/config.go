package config

import (
	"os"

	"github.com/joho/godotenv"
)

type config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
}

func Load() (*config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	conf := &config{
		Port:        os.Getenv("PORT"),
		DatabaseURL: os.Getenv("DB_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
	}

	return conf, nil

}
