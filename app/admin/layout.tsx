import type React from "react"
import { getSession } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // If not authenticated and not on login or setup page, redirect to login
  if (!session) {
    return children
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
