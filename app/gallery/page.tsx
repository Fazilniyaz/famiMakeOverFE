"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { CatalogAPI } from "@/lib/services"
import type { GalleryItem } from "@/lib/types"

const CATEGORIES = ["all", "bridal", "mehandi", "makeup", "hair", "skincare", "other"] as const

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all")
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  useEffect(() => {
    setLoading(true)
    CatalogAPI.gallery(category)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Our Work</span>
            <h1 className="mb-4 font-serif text-4xl text-foreground md:text-6xl">Gallery</h1>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              A glimpse of bridal looks, mehandi art and salon transformations
            </p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-5 py-2.5 text-sm capitalize fmo-transition ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground fmo-shadow"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="mb-4 aspect-[3/4] animate-pulse break-inside-avoid rounded-3xl bg-card" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">Gallery images coming soon.</p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setLightbox(item)}
                  className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl fmo-shadow"
                >
                  <Image
                    src={item.image?.url || "/placeholder.svg"}
                    alt={item.title || item.category}
                    width={600}
                    height={800}
                    className="h-auto w-full object-cover fmo-transition group-hover:scale-105"
                  />
                  {(item.title || item.category) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-left">
                      <p className="text-sm text-white">{item.title || item.category}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl">
            <Image
              src={lightbox.image?.url || "/placeholder.svg"}
              alt={lightbox.title || ""}
              width={1200}
              height={1600}
              className="max-h-[90vh] w-auto rounded-2xl object-contain"
            />
          </div>
        </button>
      )}

      <Footer />
    </main>
  )
}
