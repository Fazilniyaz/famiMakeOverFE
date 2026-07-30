"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getToken, setToken } from "@/lib/api"
import { AuthAPI } from "@/lib/services"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  isLoggedIn: boolean
  needsProfile: boolean
  // login modal control
  loginOpen: boolean
  openLogin: (redirectAfter?: () => void) => void
  closeLogin: () => void
  // actions
  completeLogin: (token: string, user: User, needsProfile: boolean) => void
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<User>
  logout: () => void
  setNeedsProfile: (v: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [afterLogin, setAfterLogin] = useState<(() => void) | null>(null)

  // Bootstrap: if a token exists, load the user.
  useEffect(() => {
    let active = true
    async function boot() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const u = await AuthAPI.me()
        if (active) setUser(u)
      } catch {
        setToken(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    boot()
    return () => {
      active = false
    }
  }, [])

  const openLogin = useCallback((redirectAfter?: () => void) => {
    setAfterLogin(() => redirectAfter || null)
    setLoginOpen(true)
  }, [])

  const closeLogin = useCallback(() => setLoginOpen(false), [])

  const completeLogin = useCallback(
    (token: string, u: User, np: boolean) => {
      setToken(token)
      setUser(u)
      setNeedsProfile(np)
      // Keep modal open when we still need the name step
      if (!np) setLoginOpen(false)
      // Signal other providers (cart/wishlist) to merge guest data.
      window.dispatchEvent(new CustomEvent("fmo:login"))
      if (!np && afterLogin) {
        const cb = afterLogin
        setAfterLogin(null)
        // let state settle first
        setTimeout(cb, 0)
      }
    },
    [afterLogin],
  )

  const refreshUser = useCallback(async () => {
    try {
      setUser(await AuthAPI.me())
    } catch {
      /* ignore */
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      const u = await AuthAPI.updateMe(updates)
      setUser(u)
      if (u.name) {
        setNeedsProfile(false)
        if (afterLogin) {
          const cb = afterLogin
          setAfterLogin(null)
          setTimeout(cb, 0)
        }
      }
      return u
    },
    [afterLogin],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setNeedsProfile(false)
    window.dispatchEvent(new CustomEvent("fmo:logout"))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        needsProfile,
        loginOpen,
        openLogin,
        closeLogin,
        completeLogin,
        refreshUser,
        updateProfile,
        logout,
        setNeedsProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
