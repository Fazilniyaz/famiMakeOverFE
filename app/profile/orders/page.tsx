"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, Package, Lock } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAuth } from "@/components/providers/auth-context"
import { OrderAPI } from "@/lib/services"
import { formatPrice } from "@/lib/format"
import type { Order } from "@/lib/types"

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  processing: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
}

export default function MyOrdersPage() {
  const { isLoggedIn, loading: authLoading, openLogin } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      setLoading(false)
      return
    }
    OrderAPI.mine()
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authLoading, isLoggedIn])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h1 className="mb-8 font-serif text-4xl text-foreground md:text-5xl">My Orders</h1>

          {authLoading || loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isLoggedIn ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Please log in to see your orders.</p>
              <button onClick={() => openLogin(() => {})} className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground">
                Log in
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              <Link href="/shop" className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o._id} className="rounded-3xl bg-card p-6 fmo-shadow">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-background p-2 pr-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                          {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium text-foreground">{formatPrice(o.total)}</span>
                  </div>
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
