export const dynamic = 'force-dynamic'

import { KPICards } from "@/components/dashboard/kpi-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">
            Vue d'ensemble de votre activité
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <CashflowChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
