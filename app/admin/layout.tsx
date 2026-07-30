"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-context"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminStoreProvider } from "@/components/admin/admin-store-provider"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  const isLoginRoute = pathname === "/admin/login"

  useEffect(() => {
    if (loading || isLoginRoute) return
    if (!user || user.role !== "admin") {
      router.replace("/admin/login")
    }
  }, [loading, user, isLoginRoute, router])

  // Login page renders on its own, no shell/Redux guard.
  if (isLoginRoute) return <>{children}</>

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AdminStoreProvider>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  )
}
