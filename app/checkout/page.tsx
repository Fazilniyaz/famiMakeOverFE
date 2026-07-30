"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, CheckCircle2, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/providers/cart-context"
import { useAuth } from "@/components/providers/auth-context"
import { OrderAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import { effectivePrice, formatPrice } from "@/lib/format"
import type { Address, Order } from "@/lib/types"

function addressKey(a: Partial<Address>) {
  return [a.line1, a.line2, a.city, a.state, a.pincode].map((x) => (x || "").trim().toLowerCase()).join("|")
}

function formatAddress(a: Address) {
  return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ")
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, isLoggedIn, loading: authLoading, openLogin, refreshUser } = useAuth()

  const savedAddresses = user?.addresses || []
  const hasSavedAddresses = savedAddresses.length > 0

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    note: "",
  })
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<number | "new">(0)
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const shipping = 0
  const total = subtotal + shipping

  const nameLocked = Boolean(user?.name)
  const emailLocked = Boolean(user?.email)

  // Prefill from profile
  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      name: user.name || f.name,
      phone: user.phone || f.phone,
      email: user.email || f.email,
    }))
    if (user.addresses?.length) {
      setSelectedAddressIdx(0)
      const a = user.addresses[0]
      setForm((f) => ({
        ...f,
        line1: a.line1 || "",
        line2: a.line2 || "",
        city: a.city || "",
        state: a.state || "",
        pincode: a.pincode || "",
      }))
    } else {
      setSelectedAddressIdx("new")
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !isLoggedIn) openLogin(() => {})
  }, [authLoading, isLoggedIn, openLogin])

  function pickAddress(idx: number | "new") {
    setSelectedAddressIdx(idx)
    if (idx === "new") {
      setForm((f) => ({ ...f, line1: "", line2: "", city: "", state: "", pincode: "" }))
      return
    }
    const a = savedAddresses[idx]
    if (!a) return
    setForm((f) => ({
      ...f,
      line1: a.line1 || "",
      line2: a.line2 || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
    }))
  }

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.line1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.pincode.trim() &&
      items.length > 0
    )
  }, [form, items.length])

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!items.length || !canSubmit) return
    setPlacing(true)
    try {
      const order = await OrderAPI.place({
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity, size: i.size })),
        contact: { name: form.name.trim(), phone: form.phone, email: form.email.trim() },
        shippingAddress: {
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        note: form.note || undefined,
      })
      await clearCart()
      await refreshUser()
      setPlacedOrder(order)
      window.scrollTo(0, 0)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not place order")
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center px-6 pt-28 pb-20">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center fmo-shadow">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h1 className="mb-2 font-serif text-3xl text-foreground">Order Confirmed!</h1>
            <p className="mb-1 text-muted-foreground">Thank you, {placedOrder.contact?.name}.</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Your order <span className="font-medium text-foreground">{placedOrder.orderNumber}</span> has been placed.
              We&apos;ll reach out on WhatsApp to confirm.
            </p>
            <div className="mb-6 space-y-1 rounded-2xl bg-background p-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items</span>
                <span>{formatPrice(placedOrder.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{placedOrder.shipping === 0 ? "Free" : formatPrice(placedOrder.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-medium text-foreground">
                <span>Total</span>
                <span>{formatPrice(placedOrder.total)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/profile/orders" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition">
                View My Orders
              </Link>
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground fmo-transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!authLoading && !isLoggedIn) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center pt-28">
          <Lock className="h-12 w-12 text-muted-foreground/50" />
          <h1 className="font-serif text-2xl text-foreground">Please log in to checkout</h1>
          <button onClick={() => openLogin(() => {})} className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition">
            Log in
          </button>
        </div>
        <Footer />
      </main>
    )
  }

  if (!items.length) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center pt-28">
          <h1 className="font-serif text-2xl text-foreground">Your cart is empty</h1>
          <Link href="/shop" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition">
            Start Shopping
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const input =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary fmo-transition disabled:opacity-70"

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h1 className="mb-10 font-serif text-4xl text-foreground md:text-5xl">Checkout</h1>

          <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-3xl bg-card p-6 fmo-shadow">
                <h2 className="mb-4 font-serif text-xl text-foreground">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Full name {!nameLocked && <span className="text-destructive">*</span>}
                    </label>
                    <input
                      required
                      placeholder="Full name"
                      className={input}
                      value={form.name}
                      disabled={nameLocked}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">Phone</label>
                    <input
                      required
                      placeholder="Phone"
                      className={input}
                      value={form.phone}
                      disabled={Boolean(user?.phone)}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Email {!emailLocked && <span className="text-destructive">*</span>}
                    </label>
                    <input
                      required
                      placeholder="Email"
                      type="email"
                      className={input}
                      value={form.email}
                      disabled={emailLocked}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {(!nameLocked || !emailLocked) && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Missing details will be saved to your profile for future orders.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-card p-6 fmo-shadow">
                <h2 className="mb-4 font-serif text-xl text-foreground">Delivery address</h2>

                {hasSavedAddresses && (
                  <div className="mb-4 space-y-2">
                    {savedAddresses.map((a, idx) => (
                      <label
                        key={addressKey(a) + idx}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 fmo-transition ${
                          selectedAddressIdx === idx
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          className="mt-1"
                          checked={selectedAddressIdx === idx}
                          onChange={() => pickAddress(idx)}
                        />
                        <span className="text-sm text-foreground">
                          {a.label ? <span className="font-medium">{a.label} · </span> : null}
                          {formatAddress(a)}
                        </span>
                      </label>
                    ))}
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 fmo-transition ${
                        selectedAddressIdx === "new"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1"
                        checked={selectedAddressIdx === "new"}
                        onChange={() => pickAddress("new")}
                      />
                      <span className="text-sm font-medium text-foreground">Add a new address</span>
                    </label>
                  </div>
                )}

                {(selectedAddressIdx === "new" || !hasSavedAddresses) && (
                  <>
                    {!hasSavedAddresses && (
                      <p className="mb-4 text-sm text-muted-foreground">
                        Add a delivery address — it will be saved to your profile for next time.
                      </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input required placeholder="Address line 1 *" className={`${input} sm:col-span-2`} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                      <input placeholder="Address line 2 (optional)" className={`${input} sm:col-span-2`} value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
                      <input required placeholder="City *" className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      <input required placeholder="State *" className={input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                      <input required placeholder="Pincode *" className={input} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                    </div>
                  </>
                )}

                <textarea placeholder="Order note (optional)" className={`${input} mt-4 min-h-[80px] resize-y`} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl bg-card p-6 fmo-shadow">
                <h2 className="mb-4 font-serif text-xl text-foreground">Your order</h2>
                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => {
                    const price = effectivePrice(item.product)
                    const img = item.product.images?.[0]?.url || "/placeholder.svg"
                    return (
                      <div key={`${item.product._id}-${item.size || ""}`} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <span className="text-sm text-foreground">{formatPrice(price * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-medium text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={placing || !canSubmit}
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition disabled:opacity-60"
                >
                  {placing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 fmo-transition" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Cash / pay-on-visit. We&apos;ll confirm your order on WhatsApp.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  )
}
