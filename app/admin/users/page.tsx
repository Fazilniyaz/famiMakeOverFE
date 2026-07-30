"use client"

import { useState } from "react"
import { Ban, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/format"
import type { User, Order } from "@/lib/types"
import { PageHeader, EmptyState, Badge } from "@/components/admin/kit"
import { ListToolbar } from "@/components/admin/list-toolbar"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useGetUsersQuery,
  useLazyGetUserQuery,
  useSetUserBlockedMutation,
} from "@/store/adminApi"

type Row = User & { orderCount: number; totalSpent: number }

const DATE_SORT = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
]

export default function UsersPage() {
  const list = useAdminListState({ defaultFilters: { blocked: "" } })
  const [detail, setDetail] = useState<{
    user: User
    orders: Order[]
    stats: { orderCount: number; totalSpent: number }
  } | null>(null)

  const { data, isLoading } = useGetUsersQuery(list.query)
  const rows = (data?.data || []) as Row[]
  const meta = data?.meta
  const [fetchUser] = useLazyGetUserQuery()
  const [setBlocked] = useSetUserBlockedMutation()

  async function toggleBlock(u: Row) {
    try {
      await setBlocked({ id: u._id, isBlocked: !u.isBlocked }).unwrap()
      toast.success(u.isBlocked ? "User unblocked" : "User blocked")
    } catch (err: any) {
      toast.error(err?.data?.message || "Action failed")
    }
  }

  async function openDetail(u: Row) {
    try {
      setDetail(await fetchUser(u._id).unwrap())
    } catch {
      toast.error("Could not load user")
    }
  }

  const emptyMsg = list.hasActiveQuery ? "No results." : "No customers yet."

  return (
    <div>
      <PageHeader title="Users" subtitle={`${meta?.total ?? "—"} registered customers`} />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search name / phone / email…"
        filters={[
          {
            key: "blocked",
            label: "Status",
            value: list.filters.blocked || "",
            onChange: (v) => list.setFilter("blocked", v),
            options: [
              { value: "", label: "All users" },
              { value: "1", label: "Blocked only" },
            ],
          },
        ]}
        sort={{ value: list.sort, options: DATE_SORT, onChange: list.setSort }}
      />

      {isLoading ? (
        <EmptyState message="Loading…" />
      ) : rows.length === 0 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card fmo-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Orders</th>
                  <th className="p-4 font-medium">Spent</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr
                    key={u._id}
                    className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/40"
                    onClick={() => openDetail(u)}
                  >
                    <td className="p-4 font-medium text-foreground">{u.name || "—"}</td>
                    <td className="p-4 text-muted-foreground">{u.phone ? `+${u.phone}` : "—"}</td>
                    <td className="p-4 text-muted-foreground">{u.orderCount}</td>
                    <td className="p-4 text-foreground">{formatPrice(u.totalSpent)}</td>
                    <td className="p-4">
                      {u.isBlocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Active</Badge>}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleBlock(u)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                          u.isBlocked
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {u.isBlocked ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Ban className="h-3.5 w-3.5" />
                        )}
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
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
            <DialogTitle className="font-serif text-2xl">{detail?.user.name || "Customer"}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Phone" value={detail.user.phone ? `+${detail.user.phone}` : "—"} />
                <Info label="Email" value={detail.user.email || "—"} />
                <Info label="Orders" value={String(detail.stats.orderCount)} />
                <Info label="Total spent" value={formatPrice(detail.stats.totalSpent)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Order history</p>
                {detail.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.orders.map((o) => (
                      <div
                        key={o._id}
                        className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">{o.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatPrice(o.total)}</p>
                          <Badge
                            tone={
                              o.status === "completed" || o.status === "delivered"
                                ? "green"
                                : o.status === "cancelled"
                                  ? "red"
                                  : "amber"
                            }
                          >
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}
