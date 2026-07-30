"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Lock, GraduationCap } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAuth } from "@/components/providers/auth-context"
import { EnrollmentAPI } from "@/lib/services"
import { formatPrice } from "@/lib/format"
import type { Enrollment } from "@/lib/types"

const statusColor: Record<string, string> = {
  enquiry: "bg-amber-500/15 text-amber-700",
  success: "bg-primary/10 text-primary",
  failure: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
}

export default function MyEnrollmentsPage() {
  const { isLoggedIn, loading: authLoading, openLogin } = useAuth()
  const [items, setItems] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      setLoading(false)
      return
    }
    EnrollmentAPI.mine()
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
              <h1 className="font-serif text-4xl text-foreground md:text-5xl">Your Enrolled Courses</h1>
              <p className="mt-2 text-muted-foreground">Class enrolment enquiries and their status</p>
            </div>
            <Link
              href="/classes"
              className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
            >
              Browse classes
            </Link>
          </div>

          {authLoading || loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isLoggedIn ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Please log in to see your enrolled courses.</p>
              <button
                onClick={() => openLogin(() => {})}
                className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground"
              >
                Log in
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">You haven&apos;t enquired about any courses yet.</p>
              <Link href="/classes" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground">
                Explore classes
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((e) => (
                <div key={e._id} className="rounded-3xl bg-card p-6 fmo-shadow">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{e.className || "Class"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Enquired {new Date(e.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor[e.status] || ""}`}
                    >
                      {e.status}
                    </span>
                  </div>
                  {e.classPrice != null && (
                    <p className="text-sm text-muted-foreground">{formatPrice(e.classPrice)}</p>
                  )}
                  {e.note && <p className="mt-2 text-sm italic text-muted-foreground">“{e.note}”</p>}
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
