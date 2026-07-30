"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Heart } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/providers/cart-context"
import { useWishlist } from "@/components/providers/wishlist-context"
import { effectivePrice, formatPrice, discountPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

const badgeClass = (badge?: string | null) =>
  badge === "Sale"
    ? "bg-destructive/10 text-destructive"
    : badge === "New"
      ? "bg-primary/10 text-primary"
      : "bg-accent text-accent-foreground"

export function ProductCard({
  product,
  index = 0,
  isVisible = true,
}: {
  product: Product
  index?: number
  isVisible?: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const price = effectivePrice(product)
  const off = discountPercent(product)
  const img = product.images?.[0]?.url || "/placeholder.svg"
  const wished = has(product._id)

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block transition-all duration-700 ease-out",
        isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
      )}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="overflow-hidden rounded-3xl bg-background fmo-shadow fmo-transition group-hover:scale-[1.02]">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div
            className={cn(
              "absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/50 to-muted transition-opacity duration-500",
              imageLoaded ? "opacity-0" : "opacity-100",
            )}
          />
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              "object-cover fmo-transition group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {product.badge && (
            <span
              className={cn(
                "absolute left-4 top-4 rounded-full px-3 py-1 text-xs tracking-wide",
                badgeClass(product.badge),
              )}
            >
              {product.badge}
            </span>
          )}
          {off && !product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">
              -{off}%
            </span>
          )}

          {/* Wishlist */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggle(product)
            }}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm fmo-shadow fmo-transition hover:scale-110"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", wished ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>

          {/* Quick add */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
              toast.success(`${product.name} added to cart`)
            }}
            className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-background/90 opacity-0 backdrop-blur-sm fmo-shadow fmo-transition group-hover:translate-y-0 group-hover:opacity-100"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="p-5">
          <h3 className="mb-1 font-serif text-lg text-foreground">{product.name}</h3>
          {product.shortDescription && (
            <p className="mb-3 line-clamp-1 text-sm text-muted-foreground">{product.shortDescription}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{formatPrice(price)}</span>
            {product.offerPrice != null && product.offerPrice < product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
