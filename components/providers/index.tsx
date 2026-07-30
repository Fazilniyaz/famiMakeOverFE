"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "./auth-context"
import { CartProvider } from "./cart-context"
import { WishlistProvider } from "./wishlist-context"
import { LoginModal } from "@/components/auth/login-modal"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <LoginModal />
          <Toaster position="top-center" richColors />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}
