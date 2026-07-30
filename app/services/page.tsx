"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Clock, CheckCircle2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { CatalogAPI } from "@/lib/services"
import { formatPrice, effectivePrice } from "@/lib/format"
import type { Service } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookingCalendarDialog } from "@/components/boty/services-section"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Service | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    CatalogAPI.services({ limit: 50, sort: "-isFeatured" })
      .then((r) => setServices(r.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Salon Services</span>
            <h1 className="mb-4 font-serif text-4xl text-foreground md:text-6xl">Our Services</h1>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              Bridal makeup, mehandi, facials, hair and skincare — crafted for every occasion
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-card" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No services listed yet. Please check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className="group overflow-hidden rounded-3xl bg-card text-left fmo-shadow fmo-transition hover:scale-[1.02]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={s.images?.[0]?.url || "/placeholder.svg"}
                      alt={s.name}
                      fill
                      className="object-cover fmo-transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-serif text-2xl text-foreground">{s.name}</h2>
                    {s.shortDescription && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.shortDescription}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-medium text-foreground">{formatPrice(effectivePrice(s))}</span>
                      {s.durationMinutes ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {s.durationMinutes} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selected && !bookingOpen && !successOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{selected.name}</DialogTitle>
              </DialogHeader>
              <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-muted">
                <Image src={selected.images?.[0]?.url || "/placeholder.svg"} alt="" fill className="object-cover" />
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {selected.description || selected.shortDescription}
              </p>
              <p className="mt-4 text-2xl font-medium text-foreground">{formatPrice(effectivePrice(selected))}</p>
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="mt-6 w-full rounded-full bg-primary px-8 py-3.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
              >
                Book Appointment
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {selected && (
        <BookingCalendarDialog
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          service={selected}
          onSuccess={() => {
            setBookingOpen(false)
            setSelected(null)
            setSuccessOpen(true)
          }}
        />
      )}

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-3xl text-center sm:max-w-md">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-primary" />
          <h3 className="font-serif text-2xl">Enquiry recorded</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your enquiry was recorded. You will receive a call from our side shortly. Thank you for your time!
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
