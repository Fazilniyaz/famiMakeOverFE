"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CatalogAPI } from "@/lib/services"
import type { GalleryItem } from "@/lib/types"

export function GallerySection({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    CatalogAPI.gallery()
      .then((data) => setItems(data.slice(0, limit)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [limit])

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Our Work</span>
          <h2 className="mb-4 text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Past clients
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Bridal looks, mehandi art and salon transformations we&apos;re proud of
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">Gallery coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item._id}
                href="/gallery"
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-card fmo-shadow fmo-transition hover:scale-[1.02]"
              >
                <Image
                  src={item.image?.url || "/placeholder.svg"}
                  alt={item.title || item.category}
                  fill
                  className="object-cover fmo-transition group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 opacity-0 fmo-transition group-hover:opacity-100">
                  <p className="text-sm capitalize text-white">{item.title || item.category}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-transparent px-8 py-4 text-sm tracking-wide text-foreground hover:bg-foreground/5 fmo-transition"
          >
            View Past Clients Work
          </Link>
        </div>
      </div>
    </section>
  )
}
