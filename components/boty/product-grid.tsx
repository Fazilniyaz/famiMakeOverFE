"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ProductCard } from "./product-card"
import { CatalogAPI } from "@/lib/services"
import type { Product, ProductType } from "@/lib/types"

export function ProductGrid() {
  const [types, setTypes] = useState<ProductType[]>([])
  const [selected, setSelected] = useState<string>("all")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // Load product types for the segmented control
  useEffect(() => {
    CatalogAPI.productTypes()
      .then(setTypes)
      .catch(() => setTypes([]))
  }, [])

  // Load products whenever the selected type changes
  useEffect(() => {
    setLoading(true)
    setIsVisible(false)
    CatalogAPI.products({ type: selected === "all" ? undefined : selected, limit: 8, sort: "-isFeatured" })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => {
        setLoading(false)
        setTimeout(() => setIsVisible(true), 50)
      })
  }, [selected])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    )
    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  const tabs = [{ slug: "all", name: "All" }, ...types.map((t) => ({ slug: t.slug, name: t.name }))]

  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Our Collection</span>
          <h2 className="mb-4 text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Gentle essentials
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Thoughtfully crafted products for your daily beauty ritual
          </p>
        </div>

        {/* Category pills */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setSelected(tab.slug)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium fmo-transition ${
                selected === tab.slug
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground fmo-shadow"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-background/60" />
              ))
            : products.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} isVisible={isVisible} />
              ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No products yet. Check back soon.</p>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-transparent px-8 py-4 text-sm tracking-wide text-foreground hover:bg-foreground/5 fmo-transition"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
