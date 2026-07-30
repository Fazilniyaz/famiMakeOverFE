"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { getToken } from "@/lib/api"
import { WishlistAPI } from "@/lib/services"
import type { Product } from "@/lib/types"

const GUEST_KEY = "fmo_wishlist"

interface WishlistContextType {
  items: Product[]
  ids: Set<string>
  has: (productId: string) => boolean
  toggle: (product: Product) => Promise<void>
  remove: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

function readGuest(): Product[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]")
  } catch {
    return []
  }
}
function writeGuest(items: Product[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items))
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const loggedIn = useRef(false)

  useEffect(() => {
    if (getToken()) {
      loggedIn.current = true
      WishlistAPI.get().then(setItems).catch(() => {})
    } else {
      setItems(readGuest())
    }
  }, [])

  useEffect(() => {
    const onLogin = async () => {
      loggedIn.current = true
      const guest = readGuest()
      try {
        if (guest.length) {
          await WishlistAPI.merge(guest.map((p) => p._id))
          localStorage.removeItem(GUEST_KEY)
        }
        setItems(await WishlistAPI.get())
      } catch {
        /* ignore */
      }
    }
    const onLogout = () => {
      loggedIn.current = false
      setItems(readGuest())
    }
    window.addEventListener("fmo:login", onLogin)
    window.addEventListener("fmo:logout", onLogout)
    return () => {
      window.removeEventListener("fmo:login", onLogin)
      window.removeEventListener("fmo:logout", onLogout)
    }
  }, [])

  const has = useCallback((id: string) => items.some((p) => p._id === id), [items])

  const toggle = useCallback(
    async (product: Product) => {
      const exists = items.some((p) => p._id === product._id)
      if (loggedIn.current) {
        setItems(exists ? await WishlistAPI.remove(product._id) : await WishlistAPI.add(product._id))
      } else {
        const next = exists
          ? items.filter((p) => p._id !== product._id)
          : [...items, product]
        writeGuest(next)
        setItems(next)
      }
    },
    [items],
  )

  const remove = useCallback(
    async (productId: string) => {
      if (loggedIn.current) {
        setItems(await WishlistAPI.remove(productId))
      } else {
        const next = items.filter((p) => p._id !== productId)
        writeGuest(next)
        setItems(next)
      }
    },
    [items],
  )

  return (
    <WishlistContext.Provider value={{ items, ids: new Set(items.map((p) => p._id)), has, toggle, remove }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
