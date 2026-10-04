import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Note } from '../api/types'
import { ApiError } from '../api/types'
import { useApiGuard } from '../hooks/useApi'

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function previewText(body: string, max = 140) {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= max) return plain || 'Empty note'
  return `${plain.slice(0, max).trimEnd()}…`
}

export function NotesListPage() {
  const guard = useApiGuard()
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await guard(() => api.listNotes())
        if (!cancelled) {
          setNotes(data ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Failed to load notes',
          )
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [guard])

  return (
    <section className="notes-home">
      <div className="section-head">
        <div>
          <h1>Your notes</h1>
          <p className="lede">Markdown notes owned by you.</p>
        </div>
        <Link to="/notes/new" className="btn btn-primary">
          New note
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {notes === null && !error ? (
        <p className="muted">Loading notes…</p>
      ) : null}

      {notes && notes.length === 0 ? (
        <div className="empty-state">
          <h2>No notes yet</h2>
          <p>Write your first idea in Markdown.</p>
          <Link to="/notes/new" className="btn btn-primary">
            Create a note
          </Link>
        </div>
      ) : null}

      {notes && notes.length > 0 ? (
        <ul className="note-grid">
          {notes.map((note, index) => (
            <li
              key={note.id}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <Link to={`/notes/${note.id}`} className="note-card">
                <span className="note-card-accent" aria-hidden="true" />
                <h2 className="note-title">{note.title}</h2>
                <p className="note-preview">{previewText(note.body)}</p>
                <span className="note-meta">
                  Updated {formatDate(note.updated_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
