"use client"

import {
  IndianRupee,
  ShoppingCart,
  Clock,
  Users,
  Package,
  Sparkles,
  GraduationCap,
  Loader2,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { formatPrice } from "@/lib/format"
import { PageHeader, StatCard } from "@/components/admin/kit"
import {
  useGetOverviewQuery,
  useGetRevenueSeriesQuery,
  useGetTopProductsQuery,
} from "@/store/adminApi"

export default function AdminDashboard() {
  const { data: overview, isFetching: overviewLoading } = useGetOverviewQuery()
  const { data: series = [], isFetching: seriesLoading } = useGetRevenueSeriesQuery(6)
  const { data: top = [], isFetching: topLoading } = useGetTopProductsQuery()

  const warming = (overviewLoading || seriesLoading || topLoading) && !overview

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your store performance"
        action={
          warming ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
            </span>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={overview ? formatPrice(overview.revenue) : "—"}
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          label="Orders"
          value={overview?.orders ?? "—"}
          icon={<ShoppingCart className="h-4 w-4" />}
          accent="bg-blue-500/15 text-blue-600"
        />
        <StatCard
          label="Pending"
          value={overview?.pendingOrders ?? "—"}
          icon={<Clock className="h-4 w-4" />}
          accent="bg-amber-500/15 text-amber-600"
        />
        <StatCard
          label="Customers"
          value={overview?.customers ?? "—"}
          icon={<Users className="h-4 w-4" />}
          accent="bg-primary/10 text-primary"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Products" value={overview?.products ?? "—"} icon={<Package className="h-4 w-4" />} />
        <StatCard label="Services" value={overview?.services ?? "—"} icon={<Sparkles className="h-4 w-4" />} />
        <StatCard label="Classes" value={overview?.classes ?? "—"} icon={<GraduationCap className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 fmo-shadow lg:col-span-2">
          <h2 className="mb-4 font-serif text-xl text-foreground">Revenue (last 6 months)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F5B3A" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4F5B3A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6B6560" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B6560" />
                <Tooltip formatter={(v: number) => formatPrice(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#4F5B3A" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 fmo-shadow">
          <h2 className="mb-4 font-serif text-xl text-foreground">Top products</h2>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {top.map((p, i) => (
                <li key={p._id || i} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm text-foreground">{p.name}</span>
                  </span>
                  <span className="flex-shrink-0 text-sm text-muted-foreground">{p.unitsSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
