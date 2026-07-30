"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react"
import { BrandMark } from "@/components/brand/logo"
import { useAuth } from "@/components/providers/auth-context"
import { AdminAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, completeLogin } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already an admin? Go to dashboard.
  useEffect(() => {
    if (user?.role === "admin") router.replace("/admin")
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await AdminAPI.login(email, password)
      completeLogin(res.token, res.user, false)
      router.replace("/admin")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-8 fmo-shadow">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark className="mb-3 h-12 w-12 text-primary" />
          <h1 className="font-serif text-2xl text-foreground">
            Fami<span className="italic text-primary">MakeOver</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Portal</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 focus-within:border-primary fmo-transition">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70"
              required
            />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 focus-within:border-primary fmo-transition">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm tracking-wide text-primary-foreground hover:bg-primary/90 fmo-transition disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Log in
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 fmo-transition" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
