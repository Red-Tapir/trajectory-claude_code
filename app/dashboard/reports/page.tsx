"use client"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Calendar, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const revenueByCategory = [
  { name: "Prestations", value: 98500, color: "#00876c" },
  { name: "Produits", value: 72300, color: "#3b82f6" },
  { name: "Consulting", value: 45200, color: "#8b5cf6" },
  { name: "Formation", value: 28900, color: "#f59e0b" },
]

const clientDistribution = [
  { name: "TPE", value: 45, color: "#00876c" },
  { name: "PME", value: 30, color: "#3b82f6" },
  { name: "Freelances", value: 25, color: "#8b5cf6" },
]

const monthlyGrowth = [
  { month: "Jan", growth: 5 },
  { month: "Fév", growth: 8 },
  { month: "Mar", growth: 12 },
  { month: "Avr", growth: 7 },
  { month: "Mai", growth: 15 },
  { month: "Juin", growth: 18 },
  { month: "Juil", growth: 14 },
  { month: "Août", growth: 10 },
  { month: "Sep", growth: 20 },
  { month: "Oct", growth: 25 },
  { month: "Nov", growth: 28 },
]

const reports = [
  {
    id: "1",
    name: "Rapport mensuel - Novembre 2024",
    type: "Mensuel",
    date: "30/11/2024",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Rapport trimestriel - Q3 2024",
    type: "Trimestriel",
    date: "30/09/2024",
    size: "5.1 MB",
  },
  {
    id: "3",
    name: "Analyse fiscale 2024",
    type: "Fiscal",
    date: "31/12/2024",
    size: "3.8 MB",
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
          <p className="mt-2 text-gray-600">
            Analyses et exports de vos données financières
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Générer un rapport
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              CA annuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(244900)}
            </div>
            <p className="text-xs text-green-600 mt-1">+28% vs 2023</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Marge nette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">32%</div>
            <p className="text-xs text-green-600 mt-1">+5 points vs 2023</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">68%</div>
            <p className="text-xs text-green-600 mt-1">+12% vs 2023</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Délai moyen de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">18 jours</div>
            <p className="text-xs text-green-600 mt-1">-5 jours vs 2023</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition du CA</CardTitle>
            <CardDescription>Par catégorie de service</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(value)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution clients</CardTitle>
            <CardDescription>Par type d'entreprise</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Croissance mensuelle</CardTitle>
          <CardDescription>
            Taux de croissance mois par mois (%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="growth"
                name="Croissance"
                stroke="#00876c"
                strokeWidth={3}
                dot={{ fill: "#00876c", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports disponibles</CardTitle>
          <CardDescription>
            Téléchargez vos rapports générés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                      <span>{report.type}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Exportez vos données
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Téléchargez vos rapports au format PDF, Excel ou CSV pour
                  une analyse approfondie ou le partage avec votre comptable.
                </p>
              </div>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
