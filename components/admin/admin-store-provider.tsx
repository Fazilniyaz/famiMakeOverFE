"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { Provider } from "react-redux"
import { makeAdminStore, enableAdminStoreListeners, type AdminStore } from "@/store"
import { adminApi } from "@/store/adminApi"

/**
 * Redux store scoped to the admin portal.
 * Prefetches dashboard data so the first paint feels instant on return visits.
 */
export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AdminStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = makeAdminStore()
    enableAdminStoreListeners(storeRef.current)
  }

  useEffect(() => {
    const store = storeRef.current
    if (!store) return
    // Warm cache for dashboard + common lists
    store.dispatch(adminApi.endpoints.getOverview.initiate(undefined))
    store.dispatch(adminApi.endpoints.getRevenueSeries.initiate(6))
    store.dispatch(adminApi.endpoints.getTopProducts.initiate())
    store.dispatch(adminApi.endpoints.getOrders.initiate({ limit: 20 }))
    store.dispatch(adminApi.endpoints.getProducts.initiate({ limit: 20 }))
    store.dispatch(adminApi.endpoints.getAppointments.initiate({ status: "enquiry", limit: 10 }))
    store.dispatch(adminApi.endpoints.getEnrollments.initiate({ limit: 20 }))
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
