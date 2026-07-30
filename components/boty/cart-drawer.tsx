"use client"

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCart } from "@/components/providers/cart-context"
import { useAuth } from "@/components/providers/auth-context"
import { effectivePrice, formatPrice } from "@/lib/format"

export function CartDrawer() {
  const { items, count, subtotal, isOpen, setIsOpen, updateQuantity, removeItem } = useCart()
  const { isLoggedIn, openLogin } = useAuth()
  const router = useRouter()

  const shipping = 0
  const total = subtotal + shipping

  function handleCheckout() {
    setIsOpen(false)
    if (!isLoggedIn) {
      openLogin(() => router.push("/checkout"))
      return
    }
    router.push("/checkout")
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerContent className="h-full w-full sm:max-w-[440px]">
        <DrawerHeader className="border-b border-border/50 p-6 py-3">
          <DrawerTitle className="font-serif text-2xl">Cart</DrawerTitle>
          <DrawerDescription>
            {count} {count === 1 ? "item" : "items"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <DrawerClose asChild>
                <button type="button" className="mt-4 text-sm text-primary hover:underline">
                  Continue Shopping
                </button>
              </DrawerClose>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const price = effectivePrice(item.product)
                const img = item.product.images?.[0]?.url || "/placeholder.svg"
                return (
                  <div key={`${item.product._id}-${item.size || ""}`} className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={img} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-0.5 font-serif text-base font-semibold text-foreground">
                        {item.product.name}
                      </h3>
                      {item.size && (
                        <p className="mb-2 text-xs text-muted-foreground">Size: {item.size}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.size)}
                            className="rounded-l-full p-1.5 hover:bg-muted fmo-transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.size)}
                            className="rounded-r-full p-1.5 hover:bg-muted fmo-transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product._id, item.size)}
                          className="p-1.5 text-muted-foreground hover:text-destructive fmo-transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="gap-4 border-t border-border/50 p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2 text-base font-medium text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-full bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 fmo-transition"
            >
              {isLoggedIn ? "Checkout" : "Login & Checkout"}
            </button>

            <DrawerClose asChild>
              <button
                type="button"
                className="w-full rounded-full border border-border py-4 font-medium text-foreground hover:bg-muted fmo-transition"
              >
                Continue Shopping
              </button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
