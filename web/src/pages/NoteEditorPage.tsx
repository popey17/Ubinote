import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ApiError } from '../api/types'
import { MarkdownToolbar } from '../components/MarkdownToolbar'
import { MarkdownView } from '../components/MarkdownView'
import { useApiGuard } from '../hooks/useApi'
import {
  applyMarkdownFormat,
  type FormatAction,
} from '../lib/markdownFormat'

const EMPTY_BODY = `# Ideas
- item one
- **bold** item

## Detail
Some paragraph.
`

type Mode = 'create' | 'edit'

export function NoteEditorPage({ mode }: { mode: Mode }) {
  const { id } = useParams<{ id: string }>()
  const guard = useApiGuard()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState(mode === 'create' ? EMPTY_BODY : '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function applyFormat(action: FormatAction) {
    const el = textareaRef.current
    const start = el?.selectionStart ?? body.length
    const end = el?.selectionEnd ?? body.length
    const next = applyMarkdownFormat(body, start, end, action)
    setBody(next.value)

    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(next.selectionStart, next.selectionEnd)
    })
  }

  useEffect(() => {
    if (mode !== 'edit' || !id) return
    let cancelled = false

    async function load() {
      try {
        const note = await guard(() => api.getNote(id!))
        if (!cancelled) {
          setTitle(note.title)
          setBody(note.body)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Failed to load note',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [mode, id, guard])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle || !body.trim()) {
      setError('Title and body are required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (mode === 'create') {
        const note = await guard(() => api.createNote(trimmedTitle, body))
        navigate(`/notes/${note.id}`, { replace: true })
      } else if (id) {
        const note = await guard(() =>
          api.updateNote(id, trimmedTitle, body),
        )
        navigate(`/notes/${note.id}`, { replace: true })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="muted">Loading note…</p>
  }

  return (
    <section className="editor">
      <div className="section-head">
        <div>
          <Link
            to={mode === 'edit' && id ? `/notes/${id}` : '/'}
            className="back-link"
          >
            ← Cancel
          </Link>
          <h1>{mode === 'create' ? 'New note' : 'Edit note'}</h1>
          <p className="lede">Write Markdown on the left; preview on the right.</p>
        </div>
      </div>

      <form className="editor-form" onSubmit={onSubmit}>
        <label className="title-field">
          Title
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Plain-text title"
          />
        </label>

        <div className="split-editor">
          <div className="editor-pane">
            <span className="pane-label">Markdown</span>
            <div className="editor-input">
              <MarkdownToolbar onFormat={applyFormat} />
              <textarea
                ref={textareaRef}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Tab') return
                  e.preventDefault()
                  applyFormat(e.shiftKey ? 'outdent' : 'indent')
                }}
                spellCheck={false}
                placeholder="Write Markdown…"
              />
            </div>
          </div>
          <div className="editor-pane preview-pane">
            <span className="pane-label">Preview</span>
            <MarkdownView source={body} />
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="action-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </form>
    </section>
  )
}
