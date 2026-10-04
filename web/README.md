# ubinote (web)

Vite + React + TypeScript frontend for the ubinote API. Notes are stored and edited as Markdown.

## Setup

```bash
cd web
npm install
cp .env.example .env   # optional; defaults to http://localhost:8080
npm run dev
```

App: http://localhost:5173

## Environment

| Variable       | Default                 | Purpose                          |
|----------------|-------------------------|----------------------------------|
| `VITE_API_URL` | `http://localhost:8080` | Base URL of the Go API (no slash) |

## Scripts

- `npm run dev` — local Vite server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build
- `npm run lint` — oxlint

## Features

- Register / login (JWT HttpOnly cookie `token`; `credentials: 'include'`)
- Logout clears cookie via `POST /api/v1/auth/logout`; redirect to login on `401`
- Notes list, create, Markdown view, edit with live preview, delete
