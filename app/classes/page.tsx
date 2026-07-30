"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { CatalogAPI } from "@/lib/services"
import { formatPrice, effectivePrice } from "@/lib/format"
import type { BeautyClass } from "@/lib/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EnrollmentEnquireDialog } from "@/components/boty/enrollment-enquire"

export default function ClassesPage() {
  const [classes, setClasses] = useState<BeautyClass[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<BeautyClass | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    CatalogAPI.classes({ limit: 50, sort: "-isFeatured" })
      .then((r) => setClasses(r.data))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Beauty Classes</span>
            <h1 className="mb-4 font-serif text-4xl text-foreground md:text-6xl">Learn with us</h1>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              Professional courses in bridal makeup, henna and beautician training
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-card" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No classes listed yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className="group overflow-hidden rounded-3xl bg-card text-left fmo-shadow fmo-transition hover:scale-[1.02]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={c.images?.[0]?.url || "/placeholder.svg"}
                      alt={c.name}
                      fill
                      className="object-cover fmo-transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-serif text-2xl text-foreground">{c.name}</h2>
                    {c.shortDescription && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.shortDescription}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-lg font-medium text-foreground">{formatPrice(effectivePrice(c))}</span>
                      {c.durationLabel && <span className="text-xs text-muted-foreground">{c.durationLabel}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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
          <h3 className="font-serif text-2xl">Enquiry recorded</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your enquiry about the enrollment was recorded. You will receive a call from our side shortly. Thank you!
          </p>
          <button
            type="button"
            onClick={() => setSuccessOpen(false)}
            className="mt-6 w-full rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground"
          >
            Done
          </button>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
