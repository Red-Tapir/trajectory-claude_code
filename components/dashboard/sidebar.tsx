"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Planification", href: "/dashboard/planning", icon: TrendingUp },
  { name: "Clients & CRM", href: "/dashboard/crm", icon: Users },
  { name: "Facturation", href: "/dashboard/invoices", icon: FileText },
  { name: "Rapports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900 text-white">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-800">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Trajectory
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Utilisateur</p>
                  <p className="text-xs font-medium text-gray-400">
                    Plan Pro
                  </p>
                </div>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
