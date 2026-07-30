"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type AdminListFilters = Record<string, string>

export interface UseAdminListStateOptions {
  defaultLimit?: number
  defaultSort?: string
  defaultFilters?: AdminListFilters
  debounceMs?: number
}

export function useAdminListState(options: UseAdminListStateOptions = {}) {
  const {
    defaultLimit = 20,
    defaultSort = "-createdAt",
    defaultFilters = {},
    debounceMs = 350,
  } = options

  const [page, setPage] = useState(1)
  const [limit] = useState(defaultLimit)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState(defaultSort)
  const [filters, setFilters] = useState<AdminListFilters>(defaultFilters)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), debounceMs)
    return () => clearTimeout(t)
  }, [searchInput, debounceMs])

  useEffect(() => {
    setPage(1)
  }, [search])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const setSortAndReset = useCallback((value: string) => {
    setSort(value)
    setPage(1)
  }, [])

  const query = useMemo(() => {
    const q: Record<string, string | number | undefined> = {
      page,
      limit,
      sort,
      search: search || undefined,
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value) q[key] = value
    }
    return q
  }, [page, limit, sort, search, filters])

  const hasActiveQuery = Boolean(search || Object.values(filters).some(Boolean) || sort !== defaultSort)

  return {
    page,
    setPage,
    limit,
    searchInput,
    setSearchInput,
    search,
    sort,
    setSort: setSortAndReset,
    filters,
    setFilter,
    query,
    hasActiveQuery,
  }
}
