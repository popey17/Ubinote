# personal-note

REST API for personal notes. Users register and log in with email and password, then create, list, read, update, and delete their own notes. Each note belongs to one user; other users cannot see or change it.

## Stack

- Go
- PostgreSQL ([pgx](https://github.com/jackc/pgx))
- JWT (HS256), valid for 24 hours
- bcrypt password hashes

## Requirements

- Go 1.27 or later
- PostgreSQL

## Setup

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port the API listens on |
| `DB_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify tokens |

Create a database, then apply the schema:

```bash
psql "$DB_URL" -f internal/migration/000001_init_table.up.sql
```

That creates `users` and `notes`. Deleting a user cascades to that user's notes.

## Run

```bash
go run ./cmd/api
```

The server loads `.env` from the working directory. A healthy process prints `database connected successfully` and serves `GET /health`.

With [Air](https://github.com/air-verse/air) installed, `air` rebuilds on save using `.air.toml`.

## Authentication

Protected routes expect:

```
Authorization: Bearer <token>
```

Get a token from `POST /api/v1/auth/login`.

## API

Base URL: `http://localhost:8000` (or whatever `PORT` is set to).

### Health

`GET /health`

```json
{"status": "ok"}
```

### Register

`POST /api/v1/auth/register`

```json
{"email": "ada@example.com", "password": "secret"}
```

`201` returns the new user id and email. `409` if that email is already registered.

### Login

`POST /api/v1/auth/login`

```json
{"email": "ada@example.com", "password": "secret"}
```

`200`:

```json
{"token": "<jwt>"}
```

### Current user

`GET /api/v1/me` (auth required)

```json
{"user_id": "00000000-0000-0000-0000-000000000000"}
```

### Notes

All note routes require auth. A note is visible only to the user who created it.

| Method | Path | Body |
| --- | --- | --- |
| `POST` | `/api/v1/notes` | `{"title": "...", "body": "..."}` |
| `GET` | `/api/v1/notes` | — |
| `GET` | `/api/v1/notes/{id}` | — |
| `PUT` | `/api/v1/notes/{id}` | `{"title": "...", "body": "..."}` |
| `DELETE` | `/api/v1/notes/{id}` | — |

Create returns `201`. List and get return `200`. Update returns the updated note. Title and body are both required on create and update. Missing or foreign notes return `404`.

A note looks like:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "user_id": "00000000-0000-0000-0000-000000000000",
  "title": "Shopping",
  "body": "Milk",
  "created_at": "2026-10-04T00:00:00Z",
  "updated_at": "2026-10-04T00:00:00Z"
}
```

## Layout

```
cmd/api/                 HTTP server entrypoint
internal/api/            handlers and auth middleware
internal/auth/           password hashing and JWT
internal/config/         loads .env
internal/database/       Postgres connection pool
internal/migration/      SQL schema
internal/store/          queries for users and notes
```
