import { useEffect, useState } from 'react'
import { userSchema, type User } from '../schema/auth'

const TOKEN_KEY = 'santai.token'
// const USER_KEY = 'santai.user'

/**
 * Event kustom supaya semua komponen yang memakai useAuth() ikut
 * ter-update saat login/logout. `storage` event bawaan browser hanya
 * terpicu di tab LAIN, jadi tidak cukup untuk tab yang sedang aktif.
 */
const AUTH_CHANGED = 'santai:auth-changed'

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null

  // Data di localStorage bisa basi (mis. bentuknya berubah setelah update).
  // Kalau tidak lolos skema, anggap saja belum login daripada crash.
  const parsed = userSchema.safeParse(safeJsonParse(raw))
  if (!parsed.success) {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
  return parsed.data
}

export function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  // Disimpan dalam bentuk mentah backend supaya userSchema bisa
  // mem-parse-nya lagi saat dibaca.
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      ID: user.id,
      CreatedAt: user.createdAt,
      UpdatedAt: user.updatedAt,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
    }),
  )
  emitAuthChanged()
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  emitAuthChanged()
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

/** State auth yang reaktif — dipakai Navbar, ProtectedRoute, dan dashboard. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getUser())
  const [token, setToken] = useState<string | null>(() => getToken())

  useEffect(() => {
    const sync = () => {
      setUser(getUser())
      setToken(getToken())
    }
    window.addEventListener(AUTH_CHANGED, sync)
    window.addEventListener('storage', sync) // perubahan dari tab lain
    return () => {
      window.removeEventListener(AUTH_CHANGED, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return {
    user,
    token,
    isLoggedIn: Boolean(token && user),
    isAdmin: isAdmin(user),
    logout: clearSession,
  }
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
