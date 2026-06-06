'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
  apiGet,
  apiJson,
  getToken,
  setToken,
  UNAUTHORIZED_EVENT,
} from '@/lib/api'
import { AuthResponse, AuthUser, MeResponse } from '@/lib/types'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextType {
  user: AuthUser | null
  status: AuthStatus
  login: (identifier: string, password: string) => Promise<AuthUser>
  register: (username: string, email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  // Validate any stored token on first load.
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getToken()) {
        setStatus('unauthenticated')
        return
      }
      try {
        const response = await apiGet<MeResponse>('/auth/me')
        if (cancelled) return
        setUser(response.user)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        setToken(null)
        setUser(null)
        setStatus('unauthenticated')
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  // React to 401s from anywhere in the app.
  useEffect(() => {
    function handleUnauthorized() {
      logout()
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [logout])

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await apiJson<AuthResponse>('/auth/login', {
      body: { identifier, password },
    })
    setToken(response.token)
    setUser(response.user)
    setStatus('authenticated')
    return response.user
  }, [])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const response = await apiJson<AuthResponse>('/auth/register', {
        body: { username, email, password },
      })
      setToken(response.token)
      setUser(response.user)
      setStatus('authenticated')
      return response.user
    },
    []
  )

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
