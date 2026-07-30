"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { CatalogAPI, AppointmentAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import { formatPrice, effectivePrice } from "@/lib/format"
import { useAuth } from "@/components/providers/auth-context"
import type { Service } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export function ServicesSection({ limit = 4 }: { limit?: number }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Service | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    CatalogAPI.services({ limit, sort: "-isFeatured" })
      .then((r) => setServices(r.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [limit])

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Salon Services</span>
          <h2 className="mb-4 text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Treat yourself
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Bridal, makeup, mehandi, facials and more — book a visit with us
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-card" />
              ))
            : services.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className="group overflow-hidden rounded-3xl bg-card text-left fmo-shadow fmo-transition hover:scale-[1.02]"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={s.images?.[0]?.url || "/placeholder.svg"}
                      alt={s.name}
                      fill
                      className="object-cover fmo-transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl text-foreground">{s.name}</h3>
                    {s.shortDescription && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.shortDescription}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-medium text-foreground">{formatPrice(effectivePrice(s))}</span>
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

        {!loading && services.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">Services coming soon.</p>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-8 py-4 text-sm tracking-wide text-foreground hover:bg-foreground/5 fmo-transition"
          >
            View All Services
          </Link>
        </div>
      </div>

      {/* Detail popup */}
      <Dialog open={!!selected && !bookingOpen && !successOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{selected.name}</DialogTitle>
              </DialogHeader>
              <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={selected.images?.[0]?.url || "/placeholder.svg"}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {selected.description || selected.shortDescription || "Premium salon service at FamiMakeOver."}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-medium text-foreground">{formatPrice(effectivePrice(selected))}</p>
                  {selected.offerPrice != null && selected.offerPrice < selected.price && (
                    <p className="text-sm text-muted-foreground line-through">{formatPrice(selected.price)}</p>
                  )}
                </div>
                {selected.durationMinutes ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selected.durationMinutes} min
                  </span>
                ) : null}
              </div>
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
          <h3 className="font-serif text-2xl text-foreground">Enquiry recorded</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Your enquiry was recorded. You will receive a call from our side shortly. Thank you for your time!
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

function BookingCalendarDialog({
  open,
  onClose,
  service,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  service: Service
  onSuccess: () => void
}) {
  const { isLoggedIn, openLogin, user, updateProfile } = useAuth()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [date, setDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [time, setTime] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const today = ymd(new Date())

  const needsName = !user?.name?.trim()
  const needsPhone = !user?.phone?.trim()
  const needsContact = needsName || needsPhone

  useEffect(() => {
    if (!open) return
    setContactName(user?.name || "")
    setContactPhone(user?.phone || "")
  }, [open, user])

  useEffect(() => {
    if (!date) {
      setSlots([])
      setTime(null)
      return
    }
    setSlotsLoading(true)
    setTime(null)
    AppointmentAPI.daySlots(date)
      .then((d) => setSlots(d.isClosed ? [] : d.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [date])

  async function confirm() {
    if (!date || !time) return
    if (!isLoggedIn) {
      openLogin(() => {})
      return
    }

    const name = (needsName ? contactName : user?.name || contactName).trim()
    const phone = (needsPhone ? contactPhone : user?.phone || contactPhone).trim()
    if (!name || !phone) {
      toast.error("Please enter your name and phone number")
      return
    }

    setSubmitting(true)
    try {
      // Save missing profile details before creating the enquiry
      if (needsName || needsPhone) {
        await updateProfile({
          ...(needsName ? { name } : {}),
          ...(needsPhone ? { phone } : {}),
        })
      }

      await AppointmentAPI.enquire({
        serviceId: service._id,
        date,
        time,
        contact: {
          name,
          phone,
          email: user?.email,
        },
      })
      onSuccess()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit enquiry")
    } finally {
      setSubmitting(false)
    }
  }

  const firstDow = startOfMonth(month).getDay()
  const totalDays = daysInMonth(month)
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  const input =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary fmo-transition"

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Pick a date & time</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{service.name}</p>

        {isLoggedIn && needsContact && (
          <div className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium text-foreground">Your contact details</p>
            <p className="text-xs text-muted-foreground">
              We need these to confirm your appointment. They will be saved to your profile.
            </p>
            {needsName && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Full name *</label>
                <input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your full name"
                  className={input}
                />
              </div>
            )}
            {needsPhone && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Phone number *</label>
                <input
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className={input}
                />
              </div>
            )}
          </div>
        )}

        {!needsContact && isLoggedIn && (
          <div className="mt-4 rounded-2xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Booking as <span className="font-medium text-foreground">{user?.name}</span>
            {user?.phone ? ` · +${user.phone}` : null}
          </div>
        )}

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted fmo-transition"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-foreground">
              {month.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted fmo-transition"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <span key={`e-${i}`} />
              const value = ymd(new Date(month.getFullYear(), month.getMonth(), day))
              const disabled = value < today
              const active = date === value
              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() => setDate(value)}
                  className={`aspect-square rounded-full text-sm fmo-transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : disabled
                        ? "cursor-not-allowed text-muted-foreground/40"
                        : "hover:bg-muted text-foreground"
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {date && (
          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-foreground">Available times</p>
            {slotsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots available on this day.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTime(s)}
                    className={`rounded-full px-4 py-2 text-sm fmo-transition ${
                      time === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!date || !time || submitting}
          onClick={confirm}
          className="mt-6 w-full rounded-full bg-primary px-8 py-3.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : isLoggedIn ? (
            "Confirm enquiry"
          ) : (
            "Log in to confirm"
          )}
        </button>
      </DialogContent>
    </Dialog>
  )
}

export { BookingCalendarDialog }
