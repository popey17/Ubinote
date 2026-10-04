import type {
  LoginResponse,
  MeResponse,
  Note,
  RegisterResponse,
} from './types'
import { ApiError } from './types'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
) || 'http://localhost:8080'

type RequestOptions = {
  method?: string
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(res.status, text.trim() || res.statusText)
  }

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export const api = {
  register(email: string, password: string) {
    return request<RegisterResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: { email, password },
    })
  },

  login(email: string, password: string) {
    return request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  },

  logout() {
    return request<void>('/api/v1/auth/logout', {
      method: 'POST',
    })
  },

  me() {
    return request<MeResponse>('/api/v1/me')
  },

  listNotes() {
    return request<Note[]>('/api/v1/notes')
  },

  getNote(id: string) {
    return request<Note>(`/api/v1/notes/${id}`)
  },

  createNote(title: string, body: string) {
    return request<Note>('/api/v1/notes', {
      method: 'POST',
      body: { title, body },
    })
  },

  updateNote(id: string, title: string, body: string) {
    return request<Note>(`/api/v1/notes/${id}`, {
      method: 'PUT',
      body: { title, body },
    })
  },

  deleteNote(id: string) {
    return request<void>(`/api/v1/notes/${id}`, {
      method: 'DELETE',
    })
  },
}

export { API_URL }
