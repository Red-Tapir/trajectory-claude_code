"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Euro, FileText, Users, TrendingUp, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface KPIData {
  label: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ElementType
  color: string
}

interface DashboardStats {
  revenue: number
  revenueChange: number
  pendingInvoices: number
  pendingChange: number
  activeClients: number
  activeClientsChange: number
  cashflow: number
  cashflowChange: number
}

export function KPICards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </Card>
        ))}
      </div>
    )
  }

  const kpis: KPIData[] = [
    {
      label: "Chiffre d'affaires",
      value: formatCurrency(stats?.revenue || 0),
      change: stats?.revenueChange || 0,
      changeLabel: "vs mois dernier",
      icon: Euro,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Factures en attente",
      value: stats?.pendingInvoices || 0,
      change: stats?.pendingChange || 0,
      changeLabel: "vs mois dernier",
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Clients actifs",
      value: stats?.activeClients || 0,
      change: stats?.activeClientsChange || 0,
      changeLabel: "vs mois dernier",
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Trésorerie",
      value: formatCurrency(stats?.cashflow || 0),
      change: stats?.cashflowChange || 0,
      changeLabel: "vs mois dernier",
      icon: TrendingUp,
      color: "text-primary bg-primary-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card
          key={kpi.label}
          className="hover:shadow-lg transition-shadow cursor-pointer animate-fade-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.color}`}>
              <kpi.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="flex items-center mt-2 text-sm">
              {kpi.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span
                className={kpi.change > 0 ? "text-green-600" : "text-red-600"}
              >
                {Math.abs(kpi.change)}%
              </span>
              <span className="text-gray-500 ml-2">{kpi.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
