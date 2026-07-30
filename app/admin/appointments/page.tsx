"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Phone, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/format"
import type { Appointment, AvailabilityDay } from "@/lib/types"
import { PageHeader, EmptyState, Badge, Select, PrimaryButton, GhostButton } from "@/components/admin/kit"
import { ListToolbar } from "@/components/admin/list-toolbar"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import {
  useGetAppointmentsQuery,
  useGetAvailabilityQuery,
  useSetAvailabilityMutation,
  useUpdateAppointmentStatusMutation,
} from "@/store/adminApi"

const DATE_SORT = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
]

const STATUS_TONE: Record<string, string> = {
  enquiry: "amber",
  booked: "green",
  cancelled: "red",
  completed: "blue",
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function formatPhone(phone?: string) {
  if (!phone) return ""
  return phone.startsWith("+") ? phone : `+${phone}`
}

export default function AdminAppointmentsPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => ymd(new Date()))
  const [savingDay, setSavingDay] = useState(false)
  const enquiryListState = useAdminListState({ defaultLimit: 10 })
  const historyListState = useAdminListState({
    defaultLimit: 10,
    defaultFilters: { status: "" },
  })

  const from = ymd(startOfMonth(month))
  const to = ymd(new Date(month.getFullYear(), month.getMonth() + 1, 0))

  const { data: availData, isLoading: availLoading } = useGetAvailabilityQuery({ from, to })
  const { data: monthList, isLoading: monthLoading } = useGetAppointmentsQuery({
    from,
    to,
    limit: 200,
  })
  const { data: enquiryList } = useGetAppointmentsQuery({
    ...enquiryListState.query,
    status: "enquiry",
  })
  const { data: historyList } = useGetAppointmentsQuery(historyListState.query)

  const [setAvailability] = useSetAvailabilityMutation()
  const [updateStatus] = useUpdateAppointmentStatusMutation()

  const availability = availData?.data || []
  const defaultSlots = availData?.defaultSlots || []
  const appointments = monthList?.data || []
  const enquiries = enquiryList?.data || []
  const history = historyList?.data || []
  const enquiryMeta = enquiryList?.meta
  const historyMeta = historyList?.meta
  const loading = availLoading || monthLoading

  const dayMap = useMemo(() => {
    const m = new Map<string, AvailabilityDay>()
    availability.forEach((d) => m.set(d.date, d))
    return m
  }, [availability])

  const appointmentsByDate = useMemo(() => {
    const m = new Map<string, Appointment[]>()
    appointments.forEach((a) => {
      const arr = m.get(a.date) || []
      arr.push(a)
      m.set(a.date, arr)
    })
    return m
  }, [appointments])

  const selectedDay = dayMap.get(selectedDate)
  const dayAppointments = appointmentsByDate.get(selectedDate) || []

  async function markDay(closed: boolean) {
    setSavingDay(true)
    try {
      await setAvailability({
        date: selectedDate,
        isClosed: closed,
        slots: closed
          ? []
          : selectedDay?.slots?.length
            ? selectedDay.slots
            : defaultSlots.map((t) => ({ time: t, isBooked: false })),
      }).unwrap()
      toast.success(closed ? "Day marked as booked / unavailable" : "Day opened with slots")
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update day")
    } finally {
      setSavingDay(false)
    }
  }

  async function toggleSlot(time: string, isBooked: boolean) {
    const baseSlots = selectedDay?.slots?.length
      ? selectedDay.slots.map((s) => ({ ...s }))
      : defaultSlots.map((t) => ({ time: t, isBooked: false }))

    const found = baseSlots.find((s) => s.time === time)
    if (found) found.isBooked = isBooked
    else baseSlots.push({ time, isBooked })

    setSavingDay(true)
    try {
      await setAvailability({
        date: selectedDate,
        isClosed: false,
        slots: baseSlots,
      }).unwrap()
      toast.success(isBooked ? `${time} marked booked` : `${time} marked available`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update slot")
    } finally {
      setSavingDay(false)
    }
  }

  async function changeStatus(a: Appointment, status: string) {
    try {
      await updateStatus({ id: a._id, status }).unwrap()
      toast.success(`Marked ${status}`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed")
    }
  }

  const firstDow = startOfMonth(month).getDay()
  const totalDays = daysInMonth(month)
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  const slotList = selectedDay?.isClosed
    ? []
    : selectedDay?.slots?.length
      ? selectedDay.slots
      : defaultSlots.map((t) => ({ time: t, isBooked: false }))

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage enquiries, bookings and daily availability"
      />

      {loading ? (
        <EmptyState message="Loading…" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-5 fmo-shadow">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded-full p-2 hover:bg-muted"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-medium">
                  {month.toLocaleString("en-IN", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  className="rounded-full p-2 hover:bg-muted"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <span key={`e-${i}`} />
                  const value = ymd(new Date(month.getFullYear(), month.getMonth(), day))
                  const dayInfo = dayMap.get(value)
                  const hasAppts = (appointmentsByDate.get(value) || []).length > 0
                  const active = selectedDate === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedDate(value)}
                      className={`relative aspect-square rounded-full text-sm fmo-transition ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : dayInfo?.isClosed
                            ? "bg-destructive/15 text-destructive"
                            : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {day}
                      {hasAppts && !active && (
                        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">{selectedDate}</p>
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton disabled={savingDay} onClick={() => markDay(true)}>
                    {savingDay ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark day booked"}
                  </PrimaryButton>
                  <GhostButton disabled={savingDay} onClick={() => markDay(false)}>
                    Open with slots
                  </GhostButton>
                </div>
                {selectedDay?.isClosed ? (
                  <p className="text-xs text-destructive">This day is fully unavailable.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {slotList.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        onClick={() => toggleSlot(s.time, !s.isBooked)}
                        className={`rounded-full px-3 py-1.5 text-xs fmo-transition ${
                          s.isBooked
                            ? "bg-destructive/15 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {s.time} · {s.isBooked ? "Booked" : "Free"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 fmo-shadow">
              <h3 className="mb-3 font-serif text-xl text-foreground">Appointment history</h3>
              <ListToolbar
                search={historyListState.searchInput}
                onSearchChange={historyListState.setSearchInput}
                searchPlaceholder="Search contact or service…"
                filters={[
                  {
                    key: "status",
                    label: "Status",
                    value: historyListState.filters.status || "",
                    onChange: (v) => historyListState.setFilter("status", v),
                    options: [
                      { value: "", label: "All statuses" },
                      ...["enquiry", "booked", "completed", "cancelled"].map((s) => ({
                        value: s,
                        label: s.charAt(0).toUpperCase() + s.slice(1),
                      })),
                    ],
                  },
                ]}
                sort={{
                  value: historyListState.sort,
                  options: DATE_SORT,
                  onChange: historyListState.setSort,
                }}
                className="mb-3"
              />
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {historyListState.hasActiveQuery ? "No results." : "No appointments yet."}
                </p>
              ) : (
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {history.map((a) => {
                    const name =
                      a.contact?.name ||
                      (typeof a.user === "object" ? a.user.name : "") ||
                      "Customer"
                    const phone =
                      a.contact?.phone || (typeof a.user === "object" ? a.user.phone : "")
                    return (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setSelectedDate(a.date)}
                        className="w-full rounded-xl border border-border/60 bg-background p-3 text-left hover:border-primary/40 fmo-transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {a.serviceName || "Service"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.date} · {a.time}
                            </p>
                            <p className="mt-1 truncate text-xs text-foreground">{name}</p>
                            {phone && (
                              <p className="text-xs text-muted-foreground">{formatPhone(phone)}</p>
                            )}
                          </div>
                          <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              <PaginationBar meta={historyMeta} onPageChange={historyListState.setPage} />
            </div>
          </div>

          <div className="space-y-6 xl:col-span-2">
            <div>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <h3 className="font-serif text-xl text-foreground">
                  New enquiries
                  {enquiryMeta?.total != null ? (
                    <span className="ml-2 text-sm font-sans text-muted-foreground">
                      ({enquiryMeta.total})
                    </span>
                  ) : null}
                </h3>
              </div>
              <ListToolbar
                search={enquiryListState.searchInput}
                onSearchChange={enquiryListState.setSearchInput}
                searchPlaceholder="Search contact or service…"
                sort={{
                  value: enquiryListState.sort,
                  options: DATE_SORT,
                  onChange: enquiryListState.setSort,
                }}
              />
              {enquiries.length === 0 ? (
                <EmptyState
                  message={enquiryListState.hasActiveQuery ? "No results." : "No open enquiries."}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {enquiries.map((a) => (
                    <AppointmentCard key={a._id} a={a} onStatus={changeStatus} />
                  ))}
                </div>
              )}
              <PaginationBar meta={enquiryMeta} onPageChange={enquiryListState.setPage} />
            </div>

            <div>
              <h3 className="mb-3 font-serif text-xl text-foreground">On {selectedDate}</h3>
              {dayAppointments.length === 0 ? (
                <EmptyState message="No appointments on this day." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {dayAppointments.map((a) => (
                    <AppointmentCard key={a._id} a={a} onStatus={changeStatus} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppointmentCard({
  a,
  onStatus,
}: {
  a: Appointment
  onStatus: (a: Appointment, status: string) => void
}) {
  const phone = a.contact?.phone || (typeof a.user === "object" ? a.user.phone : "")
  const name = a.contact?.name || (typeof a.user === "object" ? a.user.name : "") || "Customer"
  const email = a.contact?.email || (typeof a.user === "object" ? a.user.email : "")

  return (
    <div className="rounded-2xl border border-border bg-card p-4 fmo-shadow">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{a.serviceName || "Service"}</p>
          <p className="text-sm text-muted-foreground">
            {a.date} · {a.time}
          </p>
        </div>
        <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
      </div>
      <p className="text-sm font-medium text-foreground">{name}</p>
      {phone ? (
        <p className="text-xs text-muted-foreground">{formatPhone(phone)}</p>
      ) : (
        <p className="text-xs text-destructive">No phone on file</p>
      )}
      {email && <p className="text-xs text-muted-foreground">{email}</p>}
      {a.servicePrice != null && (
        <p className="mt-1 text-xs text-muted-foreground">{formatPrice(a.servicePrice)}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
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
          value={a.status}
          onChange={(e) => onStatus(a, e.target.value)}
          className="w-auto text-xs"
        >
          {["enquiry", "booked", "completed", "cancelled"].map((s) => (
            <option key={s} value={s}>
              Mark {s}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
