"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/providers/cart-context"
import { useAuth } from "@/components/providers/auth-context"
import { effectivePrice, formatPrice } from "@/lib/format"

export default function CartPage() {
  const { items, subtotal, count, updateQuantity, removeItem } = useCart()
  const { isLoggedIn, openLogin } = useAuth()
  const router = useRouter()

  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 49
  const total = subtotal + shipping

  function checkout() {
    if (!isLoggedIn) {
      openLogin(() => router.push("/checkout"))
      return
    }
    router.push("/checkout")
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">Shopping Cart</h1>
            <p className="mt-2 text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-14 w-14 text-muted-foreground/40" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link href="/shop" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-3">
              {/* Items */}
              <div className="space-y-4 lg:col-span-2">
                {items.map((item) => {
                  const price = effectivePrice(item.product)
                  const img = item.product.images?.[0]?.url || "/placeholder.svg"
                  return (
                    <div
                      key={`${item.product._id}-${item.size || ""}`}
                      className="flex gap-4 rounded-3xl bg-card p-4 fmo-shadow"
                    >
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-muted"
                      >
                        <Image src={img} alt={item.product.name} fill className="object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link href={`/product/${item.product.slug}`}>
                              <h3 className="font-serif text-lg text-foreground">{item.product.name}</h3>
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.product._id, item.size)}
                              className="p-1 text-muted-foreground hover:text-destructive fmo-transition"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.size)}
                              className="rounded-l-full p-2 hover:bg-muted fmo-transition"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-4 text-sm font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.size)}
                              className="rounded-r-full p-2 hover:bg-muted fmo-transition"
                              aria-label="Increase"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-medium text-foreground">{formatPrice(price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 rounded-3xl bg-card p-6 fmo-shadow">
                  <h2 className="mb-4 font-serif text-xl text-foreground">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add {formatPrice(500 - subtotal)} more for free delivery.
                      </p>
                    )}
                    <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={checkout}
                    className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
                  >
                    {isLoggedIn ? "Proceed to Checkout" : "Login & Checkout"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 fmo-transition" />
                  </button>
                  <Link
                    href="/shop"
                    className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground fmo-transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
