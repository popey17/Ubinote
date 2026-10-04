import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Note } from '../api/types'
import { ApiError } from '../api/types'
import { MarkdownView } from '../components/MarkdownView'
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

export function NoteViewPage() {
  const { id } = useParams<{ id: string }>()
  const guard = useApiGuard()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      try {
        const data = await guard(() => api.getNote(id!))
        if (!cancelled) {
          setNote(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Failed to load note',
          )
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, guard])

  async function onDelete() {
    if (!id || !note) return
    if (!window.confirm(`Delete “${note.title}”?`)) return

    setDeleting(true)
    try {
      await guard(() => api.deleteNote(id))
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  if (error && !note) {
    return (
      <section>
        <p className="form-error">{error}</p>
        <Link to="/" className="btn btn-ghost">
          Back to notes
        </Link>
      </section>
    )
  }

  if (!note) {
    return <p className="muted">Loading note…</p>
  }

  return (
    <article className="note-view">
      <div className="section-head">
        <div>
          <Link to="/" className="back-link">
            ← All notes
          </Link>
          <h1>{note.title}</h1>
          <p className="note-meta">Updated {formatDate(note.updated_at)}</p>
        </div>
        <div className="action-row">
          <Link to={`/notes/${note.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <MarkdownView source={note.body} className="note-prose" />
    </article>
  )
}
