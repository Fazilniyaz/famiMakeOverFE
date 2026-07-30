"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { getToken } from "@/lib/api"
import { CartAPI } from "@/lib/services"
import { effectivePrice } from "@/lib/format"
import type { Product, CartLine } from "@/lib/types"

const GUEST_KEY = "fmo_cart"

/** Slim product snapshot stored for guest cart lines. */
type MiniProduct = Pick<
  Product,
  "_id" | "name" | "slug" | "price" | "offerPrice" | "images" | "badge"
>

interface StoredLine {
  product: MiniProduct
  quantity: number
  size?: string
}

interface CartContextType {
  items: CartLine[]
  count: number
  subtotal: number
  isOpen: boolean
  loading: boolean
  setIsOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number, size?: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number, size?: string) => Promise<void>
  removeItem: (productId: string, size?: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const toMini = (p: Product): MiniProduct => ({
  _id: p._id,
  name: p.name,
  slug: p.slug,
  price: p.price,
  offerPrice: p.offerPrice ?? null,
  images: p.images?.slice(0, 1) || [],
  badge: p.badge ?? null,
})

const lineTotal = (p: MiniProduct, qty: number) => effectivePrice(p) * qty

function readGuest(): StoredLine[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]")
  } catch {
    return []
  }
}
function writeGuest(lines: StoredLine[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(lines))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const loggedIn = useRef(false)

  const guestToLines = (stored: StoredLine[]): CartLine[] =>
    stored.map((s) => ({
      product: s.product as Product,
      quantity: s.quantity,
      size: s.size,
      lineTotal: lineTotal(s.product, s.quantity),
    }))

  const loadGuest = useCallback(() => setItems(guestToLines(readGuest())), [])

  const loadServer = useCallback(async () => {
    setLoading(true)
    try {
      const cart = await CartAPI.get()
      setItems(cart.items)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (getToken()) {
      loggedIn.current = true
      loadServer()
    } else {
      loadGuest()
    }
  }, [loadGuest, loadServer])

  // React to login/logout events from AuthProvider
  useEffect(() => {
    const onLogin = async () => {
      loggedIn.current = true
      const guest = readGuest()
      if (guest.length) {
        try {
          await CartAPI.merge(
            guest.map((g) => ({ productId: g.product._id, quantity: g.quantity, size: g.size })),
          )
          localStorage.removeItem(GUEST_KEY)
        } catch {
          /* ignore merge errors */
        }
      }
      await loadServer()
    }
    const onLogout = () => {
      loggedIn.current = false
      loadGuest()
    }
    window.addEventListener("fmo:login", onLogin)
    window.addEventListener("fmo:logout", onLogout)
    return () => {
      window.removeEventListener("fmo:login", onLogin)
      window.removeEventListener("fmo:logout", onLogout)
    }
  }, [loadGuest, loadServer])

  const addItem = useCallback(
    async (product: Product, quantity = 1, size?: string) => {
      if (loggedIn.current) {
        setItems((await CartAPI.add(product._id, quantity, size)).items)
      } else {
        const guest = readGuest()
        const found = guest.find(
          (g) => g.product._id === product._id && (g.size || "") === (size || ""),
        )
        if (found) found.quantity = Math.min(99, found.quantity + quantity)
        else guest.push({ product: toMini(product), quantity, size })
        writeGuest(guest)
        setItems(guestToLines(guest))
      }
      setIsOpen(true)
    },
    [],
  )

  const updateQuantity = useCallback(async (productId: string, quantity: number, size?: string) => {
    if (loggedIn.current) {
      setItems((await CartAPI.update(productId, quantity, size)).items)
    } else {
      let guest = readGuest()
      if (quantity < 1) {
        guest = guest.filter((g) => !(g.product._id === productId && (g.size || "") === (size || "")))
      } else {
        const found = guest.find(
          (g) => g.product._id === productId && (g.size || "") === (size || ""),
        )
        if (found) found.quantity = Math.min(99, quantity)
      }
      writeGuest(guest)
      setItems(guestToLines(guest))
    }
  }, [])

  const removeItem = useCallback(async (productId: string, size?: string) => {
    if (loggedIn.current) {
      setItems((await CartAPI.remove(productId, size)).items)
    } else {
      const guest = readGuest().filter(
        (g) => !(g.product._id === productId && (g.size || "") === (size || "")),
      )
      writeGuest(guest)
      setItems(guestToLines(guest))
    }
  }, [])

  const clearCart = useCallback(async () => {
    if (loggedIn.current) {
      setItems((await CartAPI.clear()).items)
    } else {
      writeGuest([])
      setItems([])
    }
  }, [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isOpen,
        loading,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
