package api

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type noteRequest struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

func (h *ApiHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	var req noteRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Body == "" || req.Title == "" {
		http.Error(w, "No title or body", http.StatusBadRequest)
		return
	}

	userID, ok := UserIdFromContext(r.Context())
	if !ok {
		http.Error(w, "error in reading the ID from token", http.StatusBadRequest)
		return
	}

	note, err := h.Store.CreateNote(r.Context(), userID, req.Title, req.Body)
	if err != nil {
		http.Error(w, "Error Creating Note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(note)
}

func (h *ApiHandler) ListNotes(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIdFromContext(r.Context())
	if !ok {
		http.Error(w, "error in reading the ID from token", http.StatusBadRequest)
		return
	}

	notes, err := h.Store.ListNoteByUser(r.Context(), userID)
	if err != nil {
		http.Error(w, "Error getting Note", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(notes)
}

func (h *ApiHandler) GetNote(w http.ResponseWriter, r *http.Request) {

	noteID, err := uuid.Parse(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid note id", http.StatusBadRequest)
		return
	}

	userID, ok := UserIdFromContext(r.Context())
	if !ok {
		http.Error(w, "error in reading the ID from token", http.StatusBadRequest)
		return
	}

	note, err := h.Store.GetNoteByID(r.Context(), noteID, userID)
	if err == pgx.ErrNoRows {
		http.Error(w, "note not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(note)

}

func (h *ApiHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {

	noteID, err := uuid.Parse(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid note id", http.StatusBadRequest)
		return
	}

	var req noteRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Body == "" || req.Title == "" {
		http.Error(w, "No title or Body", http.StatusBadRequest)
		return
	}

	userID, ok := UserIdFromContext(r.Context())
	if !ok {
		http.Error(w, "error in reading the ID from token", http.StatusBadRequest)
		return
	}

	note, err := h.Store.UpdateNote(r.Context(), noteID, userID, req.Title, req.Body)
	if err == pgx.ErrNoRows {
		http.Error(w, "note not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(note)

}

func (h *ApiHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {

	noteID, err := uuid.Parse(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid note id", http.StatusBadRequest)
		return
	}

	userID, ok := UserIdFromContext(r.Context())
	if !ok {
		http.Error(w, "error in reading the ID from token", http.StatusBadRequest)
		return
	}

	err = h.Store.DeleteNote(r.Context(), noteID, userID)
	if err == pgx.ErrNoRows {
		http.Error(w, "note not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}
