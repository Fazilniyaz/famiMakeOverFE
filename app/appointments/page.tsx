"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { CatalogAPI, AppointmentAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import { formatPrice, effectivePrice } from "@/lib/format"
import { useAuth } from "@/components/providers/auth-context"
import type { AvailabilityDay, Service } from "@/lib/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export default function CustomerAppointmentsPage() {
  const { isLoggedIn, openLogin, user, updateProfile } = useAuth()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [date, setDate] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState("")
  const [dayMap, setDayMap] = useState<Record<string, AvailabilityDay>>({})
  const [bookedKeys, setBookedKeys] = useState<Set<string>>(new Set())
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [time, setTime] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const today = ymd(new Date())
  const from = ymd(startOfMonth(month))
  const to = ymd(new Date(month.getFullYear(), month.getMonth() + 1, 0))

  const needsName = isLoggedIn && !user?.name?.trim()
  const needsPhone = isLoggedIn && !user?.phone?.trim()
  const needsContact = needsName || needsPhone

  useEffect(() => {
    CatalogAPI.services({ limit: 50, sort: "-isFeatured" })
      .then((r) => {
        setServices(r.data)
        if (r.data[0]) setServiceId(r.data[0]._id)
      })
      .catch(() => setServices([]))
  }, [])

  useEffect(() => {
    AppointmentAPI.range(from, to)
      .then((data) => {
        setDayMap(data.days || {})
        setBookedKeys(new Set((data.bookings || []).map((b) => `${b.date}|${b.time}`)))
      })
      .catch(() => {
        setDayMap({})
        setBookedKeys(new Set())
      })
  }, [from, to])

  useEffect(() => {
    if (user) {
      setContactName(user.name || "")
      setContactPhone(user.phone || "")
    }
  }, [user])

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

  const selectedService = useMemo(
    () => services.find((s) => s._id === serviceId) || null,
    [services, serviceId],
  )

  const firstDow = startOfMonth(month).getDay()
  const totalDays = daysInMonth(month)
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  async function confirm() {
    if (!date || !time || !serviceId) return
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
      if (needsName || needsPhone) {
        await updateProfile({
          ...(needsName ? { name } : {}),
          ...(needsPhone ? { phone } : {}),
        })
      }
      await AppointmentAPI.enquire({
        serviceId,
        date,
        time,
        contact: { name, phone, email: user?.email },
      })
      setSuccessOpen(true)
      setTime(null)
      // refresh slots so taken time disappears
      const d = await AppointmentAPI.daySlots(date)
      setSlots(d.isClosed ? [] : d.slots)
      setBookedKeys((prev) => new Set([...prev, `${date}|${time}`]))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit enquiry")
    } finally {
      setSubmitting(false)
    }
  }

  const input =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary fmo-transition"

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-3 block text-sm uppercase tracking-[0.3em] text-primary">Book a visit</span>
              <h1 className="font-serif text-4xl text-foreground md:text-5xl">Appointments</h1>
              <p className="mt-2 max-w-lg text-muted-foreground">
                See free dates and times, pick a service, and send an enquiry. We&apos;ll call to confirm.
              </p>
            </div>
            <Link
              href="/profile/appointments"
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted fmo-transition"
            >
              Your Enquired Services
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Calendar */}
            <div className="rounded-3xl bg-card p-6 fmo-shadow lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
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

              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((day, i) => {
                  if (!day) return <span key={`e-${i}`} />
                  const value = ymd(new Date(month.getFullYear(), month.getMonth(), day))
                  const past = value < today
                  const closed = !!dayMap[value]?.isClosed
                  const disabled = past || closed
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
                          : closed
                            ? "cursor-not-allowed bg-destructive/10 text-destructive/70"
                            : past
                              ? "cursor-not-allowed text-muted-foreground/35"
                              : "hover:bg-muted text-foreground"
                      }`}
                      title={closed ? "Unavailable" : undefined}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" /> Selected
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive/20" /> Fully booked / closed
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-muted" /> Available to enquire
                </span>
              </div>
            </div>

            {/* Booking panel */}
            <div className="space-y-5 lg:col-span-2">
              <div className="rounded-3xl bg-card p-6 fmo-shadow">
                <h2 className="mb-4 font-serif text-xl text-foreground">Choose a service</h2>
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services available yet.</p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {services.map((s) => (
                      <label
                        key={s._id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 fmo-transition ${
                          serviceId === s._id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="service"
                          className="mt-1"
                          checked={serviceId === s._id}
                          onChange={() => setServiceId(s._id)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">{s.name}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            {formatPrice(effectivePrice(s))}
                            {s.durationMinutes ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {s.durationMinutes} min
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-card p-6 fmo-shadow">
                <h2 className="mb-1 font-serif text-xl text-foreground">
                  {date ? `Times on ${date}` : "Pick a date"}
                </h2>
                <p className="mb-4 text-xs text-muted-foreground">
                  Green slots are free. Booked times are hidden.
                </p>

                {!date ? (
                  <p className="text-sm text-muted-foreground">Select a date from the calendar.</p>
                ) : slotsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No free slots on this day.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => {
                      const taken = bookedKeys.has(`${date}|${s}`)
                      if (taken) return null
                      return (
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
                      )
                    })}
                  </div>
                )}

                {isLoggedIn && needsContact && (
                  <div className="mt-5 space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-foreground">Your contact details</p>
                    {needsName && (
                      <input
                        className={input}
                        placeholder="Full name *"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    )}
                    {needsPhone && (
                      <input
                        className={input}
                        placeholder="Phone number *"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    )}
                  </div>
                )}

                {!needsContact && isLoggedIn && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Booking as <span className="text-foreground">{user?.name}</span>
                    {user?.phone ? ` · +${user.phone}` : ""}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!date || !time || !serviceId || submitting}
                  onClick={confirm}
                  className="mt-5 w-full rounded-full bg-primary px-8 py-3.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : !isLoggedIn ? (
                    "Log in to enquire"
                  ) : (
                    `Enquire${selectedService ? ` · ${selectedService.name}` : ""}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-3xl text-center sm:max-w-md">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-primary" />
          <h3 className="font-serif text-2xl text-foreground">Enquiry recorded</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your enquiry was recorded. You will receive a call from our side shortly. Thank you for your time!
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/profile/appointments"
              className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground"
              onClick={() => setSuccessOpen(false)}
            >
              View Your Enquired Services
            </Link>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
