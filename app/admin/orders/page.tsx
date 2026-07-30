"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { formatPrice } from "@/lib/format"
import type { Order } from "@/lib/types"
import { PageHeader, EmptyState, Badge, Select } from "@/components/admin/kit"
import { ListToolbar } from "@/components/admin/list-toolbar"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useGetOrdersQuery,
  useLazyGetOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/store/adminApi"

const STATUSES = ["pending", "confirmed", "processing", "delivered", "completed", "cancelled"]
const statusTone: Record<string, string> = {
  pending: "amber",
  confirmed: "blue",
  processing: "blue",
  delivered: "green",
  completed: "green",
  cancelled: "red",
}

const DATE_SORT = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
]

export default function OrdersPage() {
  const list = useAdminListState({ defaultFilters: { status: "" } })
  const [detail, setDetail] = useState<Order | null>(null)

  const { data, isLoading, isFetching } = useGetOrdersQuery(list.query)
  const orders = data?.data || []
  const meta = data?.meta
  const [fetchOrder] = useLazyGetOrderQuery()
  const [updateStatus] = useUpdateOrderStatusMutation()

  async function openDetail(o: Order) {
    try {
      setDetail(await fetchOrder(o._id).unwrap())
    } catch {
      toast.error("Could not load order")
    }
  }

  async function changeStatus(o: Order, status: string) {
    try {
      const updated = await updateStatus({ id: o._id, status }).unwrap()
      toast.success(`Marked ${status}`)
      if (detail?._id === o._id) setDetail({ ...detail, status: updated.status })
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed")
    }
  }

  const customerName = (o: Order) =>
    o.contact?.name || (typeof o.user === "object" ? o.user.name : "") || "Guest"

  const emptyMsg = list.hasActiveQuery ? "No results." : "No orders yet."

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${meta?.total ?? "—"} orders${isFetching && !isLoading ? " · refreshing" : ""}`}
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search order number…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: list.filters.status || "",
            onChange: (v) => list.setFilter("status", v),
            options: [
              { value: "", label: "All statuses" },
              ...STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
            ],
          },
        ]}
        sort={{ value: list.sort, options: DATE_SORT, onChange: list.setSort }}
      />

      {isLoading ? (
        <EmptyState message="Loading…" />
      ) : orders.length === 0 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card fmo-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/40"
                    onClick={() => openDetail(o)}
                  >
                    <td className="p-4 font-medium text-foreground">{o.orderNumber}</td>
                    <td className="p-4 text-muted-foreground">{customerName(o)}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-foreground">{formatPrice(o.total)}</td>
                    <td className="p-4">
                      <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PaginationBar meta={meta} onPageChange={list.setPage} />

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{detail?.orderNumber}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge tone={statusTone[detail.status]}>{detail.status}</Badge>
                <Select
                  value={detail.status}
                  onChange={(e) => changeStatus(detail, e.target.value)}
                  className="w-auto"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      Mark {s}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 text-sm">
                <p className="font-medium text-foreground">{detail.contact?.name}</p>
                {detail.contact?.phone && (
                  <p className="text-muted-foreground">+{detail.contact.phone}</p>
                )}
                {detail.contact?.email && (
                  <p className="text-muted-foreground">{detail.contact.email}</p>
                )}
                {detail.shippingAddress?.line1 && (
                  <p className="mt-1 text-muted-foreground">
                    {[
                      detail.shippingAddress.line1,
                      detail.shippingAddress.city,
                      detail.shippingAddress.state,
                      detail.shippingAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {detail.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size ? `${item.size} · ` : ""}
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items</span>
                  <span>{formatPrice(detail.itemsTotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(detail.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
