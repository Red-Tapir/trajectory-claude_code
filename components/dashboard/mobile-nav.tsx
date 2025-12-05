"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Planification", href: "/dashboard/planning", icon: TrendingUp },
  { name: "Clients & CRM", href: "/dashboard/crm", icon: Users },
  { name: "Facturation", href: "/dashboard/invoices", icon: FileText },
  { name: "Rapports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
]

export function MobileNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Trajectory
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg animate-fade-in">
            <nav className="px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
