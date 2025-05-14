"use client"

import { BarChart, FileText, Gift, Home, LogOut, Palette, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart,
  },
  {
    title: "Leads",
    href: "/admin/leads",
    icon: Users,
  },
  {
    title: "Formulários",
    href: "/admin/forms",
    icon: FileText,
  },
  {
    title: "Roleta de Prêmios",
    href: "/admin/prize-wheel",
    icon: Gift,
  },
  {
    title: "Estilo",
    href: "/admin/styling",
    icon: Palette,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      <div className="px-3 py-2">
        <Link
          href="/"
          className="flex items-center px-3 py-2 text-sm rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <Home className="mr-3 h-4 w-4" />
          <span>Página Inicial</span>
        </Link>
      </div>

      <div className="px-3 py-2">
        <h2 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administração</h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${pathname === item.href
                  ? "text-gray-900 bg-gray-100 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-3 py-2">
        <Link
          href="/admin/login"
          className="flex items-center px-3 py-2 text-sm rounded-md text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sair</span>
        </Link>
      </div>
    </nav>
  )
}
