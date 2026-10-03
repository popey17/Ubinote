package store

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	Pool *pgxpool.Pool
}

type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{
		Pool: pool,
	}
}

type Note struct {
	ID         uuid.UUID `json:"id"`
	User_ID    uuid.UUID `json:"user_id"`
	Title      string    `json:"title"`
	Body       string    `json:"body"`
	Created_at time.Time `json:"created_at"`
	Updated_at time.Time `json:"updated_at"`
}
