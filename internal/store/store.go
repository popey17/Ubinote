package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

func (s *Store) CreateUser(ctx context.Context, email, passwordHash string) (uuid.UUID, error) {
	var id uuid.UUID
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`,
		email, passwordHash,
	).Scan(&id)

	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	u := User{}

	err := s.Pool.QueryRow(ctx,
		`SELECT id, email, password FROM users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("User not Found")
	} else if err != nil {
		return nil, err
	}

	return &u, nil
}
