import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'

export function useApiGuard() {
  const { handleUnauthorized } = useAuth()
  const navigate = useNavigate()

  return useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn()
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized()
          navigate('/login', { replace: true })
        }
        throw err
      }
    },
    [handleUnauthorized, navigate],
  )
}
