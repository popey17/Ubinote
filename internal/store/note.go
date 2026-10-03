package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (s *Store) CreateNote(ctx context.Context, userID uuid.UUID, title, body string) (*Note, error) {
	n := &Note{}

	query := "INSERT INTO notes (user_id, title, body)VALUES ($1, $2, $3) RETURNING id, user_id, title, body, created_at, updated_at"

	err := s.Pool.QueryRow(ctx, query, userID, title, body).Scan(&n.ID, &n.User_ID, &n.Title, &n.Body, &n.Created_at, &n.Updated_at)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return n, nil
}

func (s *Store) ListNoteByUser(ctx context.Context, userID uuid.UUID) ([]Note, error) {
	query := `SELECT id, user_id, title, body, created_at, updated_at
		FROM notes
		WHERE user_id = $1
		ORDER BY created_at DESC`
	rows, err := s.Pool.Query(ctx, query, userID)
	if err != nil {
		fmt.Println("error getting rows" + err.Error())
		return nil, err
	}
	defer rows.Close()

	notes := []Note{}

	for rows.Next() {
		var n Note
		err := rows.Scan(&n.ID, &n.User_ID, &n.Title, &n.Body, &n.Created_at, &n.Updated_at)
		if err != nil {
			fmt.Println("error scanning the row" + err.Error())
			return nil, err
		}
		notes = append(notes, n)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return notes, nil
}

func (s *Store) GetNoteByID(ctx context.Context, noteID, userID uuid.UUID) (*Note, error) {
	n := &Note{}

	query := `SELECT id, user_id, title, body, created_at, updated_at
		FROM notes
		WHERE id = $1 AND
		user_id = $2`

	err := s.Pool.QueryRow(ctx, query, noteID, userID).Scan(&n.ID, &n.User_ID, &n.Title, &n.Body, &n.Created_at, &n.Updated_at)
	if err != nil {
		fmt.Println("note not found", err)
		return nil, err
	}

	return n, nil
}

func (s *Store) UpdateNote(ctx context.Context, noteID, userID uuid.UUID, title, body string) (*Note, error) {
	n := &Note{}

	query := `UPDATE notes
	SET title = $1, body = $2, updated_at = now()
	WHERE id = $3 AND user_id = $4
	RETURNING id, user_id, title, body, created_at, updated_at`

	err := s.Pool.QueryRow(ctx, query, title, body, noteID, userID).Scan(&n.ID, &n.User_ID, &n.Title, &n.Body, &n.Created_at, &n.Updated_at)
	if err != nil {
		return nil, err
	}

	return n, nil
}

func (s *Store) DeleteNote(ctx context.Context, noteID, userID uuid.UUID) error {

	query := `DELETE FROM notes WHERE id = $1 AND user_id = $2`

	tag, err := s.Pool.Exec(ctx, query, noteID, userID)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	return nil
}
