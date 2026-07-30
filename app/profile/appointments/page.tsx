"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Lock, CalendarDays, Sparkles } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAuth } from "@/components/providers/auth-context"
import { AppointmentAPI } from "@/lib/services"
import { formatPrice } from "@/lib/format"
import type { Appointment } from "@/lib/types"

const statusColor: Record<string, string> = {
  enquiry: "bg-amber-500/15 text-amber-700",
  booked: "bg-primary/10 text-primary",
  completed: "bg-blue-500/15 text-blue-700",
  cancelled: "bg-destructive/10 text-destructive",
}

export default function MyAppointmentsPage() {
  const { isLoggedIn, loading: authLoading, openLogin } = useAuth()
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      setLoading(false)
      return
    }
    AppointmentAPI.mine()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [authLoading, isLoggedIn])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-foreground md:text-5xl">Your Enquired Services</h1>
              <p className="mt-2 text-muted-foreground">Appointments and service enquiries you have sent</p>
            </div>
            <Link
              href="/appointments"
              className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
            >
              Book appointment
            </Link>
          </div>

          {authLoading || loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isLoggedIn ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Please log in to see your enquired services.</p>
              <button
                onClick={() => openLogin(() => {})}
                className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground"
              >
                Log in
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">You haven&apos;t enquired about any services yet.</p>
              <Link href="/appointments" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground">
                Browse availability
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((a) => (
                <div key={a._id} className="rounded-3xl bg-card p-6 fmo-shadow">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{a.serviceName || "Service"}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.date} · {a.time}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Enquired {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor[a.status] || ""}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  {a.servicePrice != null && (
                    <p className="text-sm text-muted-foreground">{formatPrice(a.servicePrice)}</p>
                  )}
                  {a.note && <p className="mt-2 text-sm italic text-muted-foreground">“{a.note}”</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
