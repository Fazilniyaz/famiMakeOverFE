"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useWishlist } from "@/components/providers/wishlist-context"
import { useCart } from "@/components/providers/cart-context"
import { effectivePrice, formatPrice } from "@/lib/format"

export default function WishlistPage() {
  const { items, remove } = useWishlist()
  const { addItem } = useCart()

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Saved for later</span>
            <h1 className="mb-3 font-serif text-4xl text-foreground md:text-5xl">Your Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Heart className="h-14 w-14 text-muted-foreground/40" />
              <p className="text-muted-foreground">Your wishlist is empty.</p>
              <Link href="/shop" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => {
                const price = effectivePrice(product)
                const img = product.images?.[0]?.url || "/placeholder.svg"
                return (
                  <div key={product._id} className="overflow-hidden rounded-3xl bg-card fmo-shadow">
                    <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-muted">
                      <Image src={img} alt={product.name} fill className="object-cover fmo-transition hover:scale-105" />
                    </Link>
                    <div className="p-5">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="mb-1 font-serif text-lg text-foreground">{product.name}</h3>
                      </Link>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="font-medium text-foreground">{formatPrice(price)}</span>
                        {product.offerPrice != null && product.offerPrice < product.price && (
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            addItem(product)
                            toast.success(`${product.name} added to cart`)
                          }}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
                        >
                          <ShoppingBag className="h-4 w-4" /> Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            remove(product._id)
                            toast.success("Removed from wishlist")
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-border px-3 py-2.5 text-muted-foreground hover:text-destructive fmo-transition"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
