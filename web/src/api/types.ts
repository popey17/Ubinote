export type Note = {
  id: string
  user_id: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

export type LoginResponse = {
  token?: string
}

export type RegisterResponse = {
  id: string
  email: string
}

export type MeResponse = {
  user_id: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
