"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  Minus,
  Plus,
  ChevronDown,
  Leaf,
  Heart,
  Award,
  Recycle,
  Star,
  Check,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { CatalogAPI } from "@/lib/services"
import { useCart } from "@/components/providers/cart-context"
import { useWishlist } from "@/components/providers/wishlist-context"
import { useAuth } from "@/components/providers/auth-context"
import { effectivePrice, formatPrice, discountPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

const benefits = [
  { icon: Leaf, label: "100% Natural" },
  { icon: Heart, label: "Cruelty-Free" },
  { icon: Recycle, label: "Eco-Friendly" },
  { icon: Award, label: "Expert Approved" },
]

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery"

const DELIVERY_TEXT =
  "Free delivery on orders over ₹500. All orders are processed within 1–2 business days. Returns accepted within 7 days of delivery if the product is unused and sealed."

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)

  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const { isLoggedIn, openLogin } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    CatalogAPI.product(productId)
      .then((p) => {
        setProduct(p)
        setSelectedSize(p.sizes?.[0])
        setActiveImage(0)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [productId])

  const toggleAccordion = (section: AccordionSection) =>
    setOpenAccordion(openAccordion === section ? null : section)

  function handleAddToCart() {
    if (!product) return
    addItem(product, quantity, selectedSize)
    setIsAdded(true)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setIsAdded(false), 2000)
  }

  function handleBuyNow() {
    if (!product) return
    addItem(product, quantity, selectedSize)
    if (!isLoggedIn) {
      openLogin(() => router.push("/checkout"))
      return
    }
    router.push("/checkout")
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-serif text-3xl text-foreground">Product not found</h1>
          <Link href="/shop" className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const price = effectivePrice(product)
  const off = discountPercent(product)
  const wished = has(product._id)
  const images = product.images?.length ? product.images : [{ url: "/placeholder.svg" }]

  const accordionItems: { key: AccordionSection; title: string; content?: string }[] = [
    { key: "details", title: "Details", content: product.description },
    { key: "howToUse", title: "How to Use", content: product.howToUse },
    { key: "ingredients", title: "Ingredients", content: product.ingredients },
    { key: "delivery", title: "Delivery & Returns", content: DELIVERY_TEXT },
  ].filter((i) => i.content)

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/shop"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground fmo-transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-card fmo-shadow">
                <Image src={images[activeImage].url} alt={product.name} fill className="object-cover" priority />
                {off && (
                  <span className="absolute left-4 top-4 rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">
                    -{off}%
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "relative h-20 w-20 overflow-hidden rounded-2xl bg-card fmo-transition",
                        activeImage === i ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                      )}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="mb-8">
                <span className="mb-2 block text-sm uppercase tracking-[0.3em] text-primary">
                  {typeof product.productType === "object" ? product.productType.name : "FamiMakeOver"}
                </span>
                <h1 className="mb-3 font-serif text-4xl text-foreground md:text-5xl">{product.name}</h1>
                {product.tagline && <p className="mb-4 text-lg italic text-muted-foreground">{product.tagline}</p>}

                <div className="mb-4 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.round(product.ratingAverage || 5)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.ratingCount || 0} reviews)</span>
                </div>

                {product.description && (
                  <p className="leading-relaxed text-foreground/80">{product.shortDescription || product.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-8 flex items-center gap-3">
                <span className="text-3xl font-medium text-foreground">{formatPrice(price)}</span>
                {product.offerPrice != null && product.offerPrice < product.price && (
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                )}
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-foreground">Size</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "rounded-full px-6 py-3 text-sm fmo-transition fmo-shadow",
                          selectedSize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-foreground hover:bg-card/80",
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium text-foreground">Quantity</label>
                <div className="inline-flex items-center gap-4 rounded-full bg-card px-2 py-2 fmo-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 hover:text-foreground fmo-transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 hover:text-foreground fmo-transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-4 text-sm tracking-wide fmo-transition fmo-shadow",
                    isAdded ? "bg-primary/80 text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" /> Added to Cart
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-foreground/20 bg-transparent px-8 py-4 text-sm tracking-wide text-foreground hover:bg-foreground/5 fmo-transition"
                >
                  Buy Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggle(product)
                    toast.success(wished ? "Removed from wishlist" : "Added to wishlist")
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-foreground/20 px-5 py-4 hover:bg-foreground/5 fmo-transition"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={cn("h-5 w-5", wished ? "fill-destructive text-destructive" : "text-foreground")} />
                </button>
              </div>

              {/* Benefits */}
              <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {benefits.map((benefit) => (
                  <div key={benefit.label} className="flex flex-col items-center gap-2 rounded-md p-4">
                    <benefit.icon className="h-5 w-5 text-primary" />
                    <span className="text-center text-xs text-muted-foreground">{benefit.label}</span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              {accordionItems.length > 0 && (
                <div className="border-t border-border/50">
                  {accordionItems.map((item) => (
                    <div key={item.key} className="border-b border-border/50">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.key)}
                        className="flex w-full items-center justify-between py-5 text-left"
                      >
                        <span className="font-medium text-foreground">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-muted-foreground fmo-transition",
                            openAccordion === item.key && "rotate-180",
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "overflow-hidden fmo-transition",
                          openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0",
                        )}
                      >
                        <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
