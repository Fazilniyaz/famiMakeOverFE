"use client"

import { Phone } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/format"
import type { Enrollment } from "@/lib/types"
import { PageHeader, EmptyState, Badge, Select } from "@/components/admin/kit"
import { ListToolbar } from "@/components/admin/list-toolbar"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import { useGetEnrollmentsQuery, useUpdateEnrollmentStatusMutation } from "@/store/adminApi"

const STATUS_TONE: Record<string, string> = {
  enquiry: "amber",
  success: "green",
  failure: "red",
  cancelled: "red",
}

const DATE_SORT = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
]

function formatPhone(phone?: string) {
  if (!phone) return ""
  return phone.startsWith("+") ? phone : `+${phone}`
}

export default function AdminEnrollmentsPage() {
  const list = useAdminListState({ defaultFilters: { status: "" } })
  const { data, isLoading, isFetching } = useGetEnrollmentsQuery(list.query)
  const rows = data?.data || []
  const meta = data?.meta
  const [updateStatus] = useUpdateEnrollmentStatusMutation()

  async function changeStatus(e: Enrollment, status: string) {
    try {
      await updateStatus({ id: e._id, status }).unwrap()
      toast.success(`Marked ${status}`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed")
    }
  }

  const emptyMsg = list.hasActiveQuery ? "No results." : "No enrollments yet."

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle={`${meta?.total ?? "—"} class enquiries${isFetching && !isLoading ? " · refreshing" : ""}`}
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search contact or class…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: list.filters.status || "",
            onChange: (v) => list.setFilter("status", v),
            options: [
              { value: "", label: "All statuses" },
              ...["enquiry", "success", "failure", "cancelled"].map((s) => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              })),
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((e) => {
            const phone = e.contact?.phone || (typeof e.user === "object" ? e.user.phone : "")
            const name =
              e.contact?.name || (typeof e.user === "object" ? e.user.name : "") || "Customer"
            const email = e.contact?.email || (typeof e.user === "object" ? e.user.email : "")
            return (
              <div key={e._id} className="rounded-2xl border border-border bg-card p-5 fmo-shadow">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{e.className || "Class"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge>
                </div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                {phone ? (
                  <p className="text-xs text-muted-foreground">{formatPhone(phone)}</p>
                ) : (
                  <p className="text-xs text-destructive">No phone on file</p>
                )}
                {email && <p className="text-xs text-muted-foreground">{email}</p>}
                {e.classPrice != null && (
                  <p className="mt-1 text-xs text-muted-foreground">{formatPrice(e.classPrice)}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {formatPhone(phone)}
                    </a>
                  )}
                  <Select
                    value={e.status}
                    onChange={(ev) => changeStatus(e, ev.target.value)}
                    className="w-auto text-xs"
                  >
                    {["enquiry", "success", "failure", "cancelled"].map((s) => (
                      <option key={s} value={s}>
                        Mark {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PaginationBar meta={meta} onPageChange={list.setPage} />
    </div>
  )
}
