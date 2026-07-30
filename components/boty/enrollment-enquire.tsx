"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { GraduationCap, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { EnrollmentAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import { formatPrice, effectivePrice } from "@/lib/format"
import { useAuth } from "@/components/providers/auth-context"
import type { BeautyClass } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/**
 * Class detail + enrolment enquiry dialog.
 * Asks for name/phone when missing from profile, saves them, then submits enquiry.
 */
export function EnrollmentEnquireDialog({
  selected,
  onClose,
  onSuccess,
}: {
  selected: BeautyClass | null
  onClose: () => void
  onSuccess: () => void
}) {
  const { isLoggedIn, openLogin, user, updateProfile } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const needsName = !user?.name?.trim()
  const needsPhone = !user?.phone?.trim()
  const needsContact = needsName || needsPhone

  useEffect(() => {
    if (!selected) return
    setContactName(user?.name || "")
    setContactPhone(user?.phone || "")
  }, [selected, user])

  async function enquire() {
    if (!selected) return
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

      await EnrollmentAPI.enquire({
        classId: selected._id,
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

  const input =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary fmo-transition"

  return (
    <Dialog open={!!selected} onOpenChange={(o) => !o && onClose()}>
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
            <p className="leading-relaxed text-muted-foreground">
              {selected.description ||
                selected.shortDescription ||
                "Professional beauty training at FamiMakeOver."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-medium text-foreground">
                {formatPrice(effectivePrice(selected))}
              </p>
              {selected.level && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize text-muted-foreground">
                  {selected.level}
                </span>
              )}
              {selected.durationLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {selected.durationLabel}
                </span>
              )}
            </div>

            {isLoggedIn && needsContact && (
              <div className="mt-5 space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">Your contact details</p>
                <p className="text-xs text-muted-foreground">
                  We need these to confirm your enrolment. They will be saved to your profile.
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
              <div className="mt-5 rounded-2xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Enquiring as <span className="font-medium text-foreground">{user?.name}</span>
                {user?.phone ? ` · +${user.phone}` : null}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={enquire}
              className="mt-6 w-full rounded-full bg-primary px-8 py-3.5 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : isLoggedIn ? (
                "Enquiry & Enroll"
              ) : (
                "Log in to enquire"
              )}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
