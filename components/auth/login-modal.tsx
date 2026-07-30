"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, ArrowRight, Loader2, Check, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/components/providers/auth-context"
import { AuthAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"

type Step = "details" | "otp" | "name"

export function LoginModal() {
  const { loginOpen, closeLogin, completeLogin, needsProfile, updateProfile, user } = useAuth()

  const [step, setStep] = useState<Step>("details")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)

  // Reset when opened
  useEffect(() => {
    if (loginOpen) {
      if (needsProfile && user) {
        setStep("name")
      } else {
        setStep("details")
        setEmail("")
        setPhone("")
        setCode("")
        setName("")
        setError(null)
        setInfo(null)
      }
    }
  }, [loginOpen, needsProfile, user])

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  async function handleRequestOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const res = await AuthAPI.requestOtp(email.trim(), phone.trim())
      setStep("otp")
      setResendIn(30)
      setInfo(
        res.devCode
          ? `Dev mode: your OTP is ${res.devCode} (also printed in the server console).`
          : res.message,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await AuthAPI.verifyOtp(email.trim(), phone.trim(), code)
      completeLogin(res.token, res.user, res.needsProfile)
      if (res.needsProfile) {
        setStep("name")
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid OTP. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveName(e?: React.FormEvent) {
    e?.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)
    try {
      await updateProfile({ name: name.trim() })
      closeLogin()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your name.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={loginOpen} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border-border/60 p-0 overflow-hidden">
        <div className="bg-primary/95 px-8 pb-7 pt-8 text-center text-primary-foreground">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15">
            {step === "name" ? <Check className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <DialogTitle className="font-serif text-2xl">
            {step === "details" && "Welcome to FamiMakeOver"}
            {step === "otp" && "Verify your email"}
            {step === "name" && "Almost there!"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-primary-foreground/80">
            {step === "details" && "Login or sign up with email and phone."}
            {step === "otp" && `Enter the code we sent to ${email.trim()}.`}
            {step === "name" && "What should we call you?"}
          </DialogDescription>
        </div>

        <div className="px-8 py-7">
          {error && (
            <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}
          {info && step === "otp" && (
            <p className="mb-4 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">{info}</p>
          )}

          {step === "details" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 focus-within:border-primary fmo-transition">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70"
                  required
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 focus-within:border-primary fmo-transition">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70"
                  required
                />
              </div>
              <SubmitButton loading={loading} label="Continue" />
              <p className="text-center text-xs text-muted-foreground">
                We&apos;ll email a one-time code. New here? This creates your account. Returning?
                Same steps to log in.
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="w-full rounded-full border border-border bg-card px-4 py-3 text-center text-2xl tracking-[0.5em] text-foreground outline-none focus:border-primary fmo-transition"
                required
              />
              <SubmitButton loading={loading} label="Verify & Log in" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button type="button" onClick={() => setStep("details")} className="hover:text-foreground">
                  Change details
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0}
                  onClick={handleRequestOtp}
                  className="hover:text-foreground disabled:opacity-50"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {step === "name" && (
            <form onSubmit={handleSaveName} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground outline-none focus:border-primary fmo-transition"
                required
              />
              <SubmitButton loading={loading} label="Save & Continue" />
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm tracking-wide text-primary-foreground fmo-transition hover:bg-primary/90 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 fmo-transition" />
        </>
      )}
    </button>
  )
}
