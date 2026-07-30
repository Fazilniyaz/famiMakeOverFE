"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { CatalogAPI } from "@/lib/services"
import { formatPrice, effectivePrice } from "@/lib/format"
import type { BeautyClass } from "@/lib/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EnrollmentEnquireDialog } from "@/components/boty/enrollment-enquire"

export function ClassesSection({ limit = 4 }: { limit?: number }) {
  const [classes, setClasses] = useState<BeautyClass[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<BeautyClass | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    CatalogAPI.classes({ limit, sort: "-isFeatured" })
      .then((r) => setClasses(r.data))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [limit])

  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Beauty Classes</span>
          <h2 className="mb-4 text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Learn with us
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Professional beauty courses designed to launch your career
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-background/60" />
              ))
            : classes.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className="group overflow-hidden rounded-3xl bg-background text-left fmo-shadow fmo-transition hover:scale-[1.02]"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={c.images?.[0]?.url || "/placeholder.svg"}
                      alt={c.name}
                      fill
                      className="object-cover fmo-transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl text-foreground">{c.name}</h3>
                    {c.shortDescription && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.shortDescription}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{formatPrice(effectivePrice(c))}</span>
                      {c.durationLabel && (
                        <span className="text-xs text-muted-foreground">{c.durationLabel}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
        </div>

        {!loading && classes.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">Classes coming soon.</p>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/classes"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-8 py-4 text-sm tracking-wide text-foreground hover:bg-foreground/5 fmo-transition"
          >
            View All Classes
          </Link>
        </div>
      </div>

      <EnrollmentEnquireDialog
        selected={selected}
        onClose={() => setSelected(null)}
        onSuccess={() => {
          setSelected(null)
          setSuccessOpen(true)
        }}
      />

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-3xl text-center sm:max-w-md">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-primary" />
          <h3 className="font-serif text-2xl text-foreground">Enquiry recorded</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your enquiry about the enrollment was recorded. You will receive a call from our side shortly. Thank you!
          </p>
          <button
            type="button"
            onClick={() => setSuccessOpen(false)}
            className="mt-6 w-full rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
          >
            Done
          </button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
