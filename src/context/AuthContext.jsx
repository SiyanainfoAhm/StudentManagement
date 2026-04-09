import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { STORAGE_KEYS } from '../utils/constants.js'
import { loginWithEmailPassword, getUserById } from '../services/authService.js'

export const AuthContext = createContext(null)

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.user?.id) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredSession(session) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEYS.session)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const restore = useCallback(async () => {
    setLoading(true)
    try {
      const session = readStoredSession()
      if (!session?.user?.id) {
        setUser(null)
        return
      }
      // Refresh from DB so role/active state updates are respected
      const fresh = await getUserById(session.user.id)
      if (!fresh || !fresh.is_active) {
        clearStoredSession()
        setUser(null)
        return
      }
      setUser(fresh)
      writeStoredSession({ user: fresh, createdAt: session.createdAt || new Date().toISOString() })
    } catch {
      clearStoredSession()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restore()
  }, [restore])

  const login = useCallback(async ({ email, password }) => {
    const u = await loginWithEmailPassword({ email, password })
    setUser(u)
    writeStoredSession({ user: u, createdAt: new Date().toISOString() })
    toast.success(`Welcome back, ${u.first_name}!`)
    return u
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
    toast('Signed out.')
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, restore }), [
    user,
    loading,
    login,
    logout,
    restore,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

