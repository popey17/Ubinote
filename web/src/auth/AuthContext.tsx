import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api/client'
import { ApiError } from '../api/types'

type AuthState = {
  authenticated: boolean
  userId: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  handleUnauthorized: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const clearSession = () => {
    setAuthenticated(false)
    setUserId(null)
  }

  const handleUnauthorized = () => {
    clearSession()
  }

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const me = await api.me()
        if (!cancelled) {
          setAuthenticated(true)
          setUserId(me.user_id)
        }
      } catch (err) {
        if (!cancelled) {
          clearSession()
          if (!(err instanceof ApiError && err.status === 401)) {
            // keep logged out on any bootstrap failure
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    await api.login(email, password)
    const me = await api.me()
    setAuthenticated(true)
    setUserId(me.user_id)
  }

  const register = async (email: string, password: string) => {
    await api.register(email, password)
    await login(email, password)
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // still clear local session if cookie clear fails
    } finally {
      clearSession()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        userId,
        loading,
        login,
        register,
        logout,
        handleUnauthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
