"use client"

import { Search } from "lucide-react"
import { TextInput, Select } from "@/components/admin/kit"
import { cn } from "@/lib/utils"

export interface ListToolbarFilter {
  key: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}

export interface ListToolbarSort {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function ListToolbar({
  search,
  searchPlaceholder = "Search…",
  onSearchChange,
  filters = [],
  sort,
  className,
}: {
  search?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  filters?: ListToolbarFilter[]
  sort?: ListToolbarSort
  className?: string
}) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {onSearchChange && (
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}
      {filters.map((f) => (
        <Select
          key={f.key}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className={cn("sm:w-44", f.className)}
          aria-label={f.label}
        >
          {f.options.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}
      {sort && (
        <Select
          value={sort.value}
          onChange={(e) => sort.onChange(e.target.value)}
          className="sm:w-44"
          aria-label="Sort"
        >
          {sort.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  )
}
