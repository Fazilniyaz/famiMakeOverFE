"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Lock, Package, Heart, Sparkles, GraduationCap, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAuth } from "@/components/providers/auth-context"
import { ApiError } from "@/lib/api"

export default function ProfilePage() {
  const { user, isLoggedIn, loading, openLogin, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", gender: "unspecified", line1: "", city: "", state: "", pincode: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "unspecified",
        line1: user.addresses?.[0]?.line1 || "",
        city: user.addresses?.[0]?.city || "",
        state: user.addresses?.[0]?.state || "",
        pincode: user.addresses?.[0]?.pincode || "",
      })
    }
  }, [user])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        name: form.name,
        email: form.email || undefined,
        gender: form.gender as never,
        addresses: [{ label: "Home", line1: form.line1, city: form.city, state: form.state, pincode: form.pincode }],
      })
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const input =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary fmo-transition"

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="mb-8 font-serif text-4xl text-foreground md:text-5xl">My Profile</h1>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isLoggedIn ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Please log in to view your profile.</p>
              <button onClick={() => openLogin(() => {})} className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground">
                Log in
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap gap-3">
                <Link href="/profile/orders" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted fmo-transition">
                  <Package className="h-4 w-4" /> My Orders
                </Link>
                <Link href="/profile/appointments" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted fmo-transition">
                  <Sparkles className="h-4 w-4" /> Enquired Services
                </Link>
                <Link href="/profile/enrollments" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted fmo-transition">
                  <GraduationCap className="h-4 w-4" /> Enrolled Courses
                </Link>
                <Link href="/appointments" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted fmo-transition">
                  <CalendarDays className="h-4 w-4" /> Book Appointment
                </Link>
                <Link href="/wishlist" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted fmo-transition">
                  <Heart className="h-4 w-4" /> Wishlist
                </Link>
              </div>

              <form onSubmit={save} className="space-y-6 rounded-3xl bg-card p-6 fmo-shadow">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-foreground">Name</span>
                    <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-foreground">Phone</span>
                    <input className={`${input} opacity-60`} value={user?.phone ? `+${user.phone}` : ""} disabled />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-foreground">Gender</span>
                    <select className={input} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="unspecified">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">Address</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input placeholder="Address line" className={`${input} sm:col-span-2`} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                    <input placeholder="City" className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <input placeholder="State" className={input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    <input placeholder="Pincode" className={input} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition disabled:opacity-60">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
