"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import {
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

const budgetData = [
  {
    month: "Jan",
    planned: 15000,
    actual: 12500,
  },
  {
    month: "Fév",
    planned: 16000,
    actual: 15200,
  },
  {
    month: "Mar",
    planned: 18000,
    actual: 18600,
  },
  {
    month: "Avr",
    planned: 17000,
    actual: 16800,
  },
  {
    month: "Mai",
    planned: 20000,
    actual: 21400,
  },
  {
    month: "Juin",
    planned: 22000,
    actual: 24500,
  },
  {
    month: "Juil",
    planned: 21000,
    actual: 22100,
  },
  {
    month: "Août",
    planned: 19000,
    actual: 19800,
  },
  {
    month: "Sep",
    planned: 24000,
    actual: 25300,
  },
  {
    month: "Oct",
    planned: 26000,
    actual: 28700,
  },
  {
    month: "Nov",
    planned: 28000,
    actual: 31200,
  },
  {
    month: "Déc",
    planned: 30000,
    actual: 0,
  },
]

const scenarioData = [
  { month: "Jan", optimiste: 18000, réaliste: 15000, pessimiste: 12000 },
  { month: "Fév", optimiste: 20000, réaliste: 16000, pessimiste: 13000 },
  { month: "Mar", optimiste: 24000, réaliste: 20000, pessimiste: 16000 },
  { month: "Avr", optimiste: 28000, réaliste: 24000, pessimiste: 19000 },
  { month: "Mai", optimiste: 32000, réaliste: 28000, pessimiste: 22000 },
  { month: "Juin", optimiste: 36000, réaliste: 32000, pessimiste: 25000 },
]

interface Budget {
  id: string
  category: string
  planned: number
  actual: number
  type: "revenue" | "expense"
}

const budgets: Budget[] = [
  {
    id: "1",
    category: "Prestations de service",
    planned: 120000,
    actual: 98500,
    type: "revenue",
  },
  {
    id: "2",
    category: "Ventes de produits",
    planned: 80000,
    actual: 72300,
    type: "revenue",
  },
  {
    id: "3",
    category: "Salaires",
    planned: 60000,
    actual: 58200,
    type: "expense",
  },
  {
    id: "4",
    category: "Marketing",
    planned: 15000,
    actual: 12800,
    type: "expense",
  },
  {
    id: "5",
    category: "Infrastructure",
    planned: 12000,
    actual: 11500,
    type: "expense",
  },
]

export default function PlanningPage() {
  const totalPlanned = budgets
    .filter((b) => b.type === "revenue")
    .reduce((sum, b) => sum + b.planned, 0)
  const totalActual = budgets
    .filter((b) => b.type === "revenue")
    .reduce((sum, b) => sum + b.actual, 0)
  const variance = ((totalActual - totalPlanned) / totalPlanned) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Planification financière
          </h1>
          <p className="mt-2 text-gray-600">
            Budgets, prévisions et simulations de scénarios
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau budget
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau scénario
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Budget annuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalPlanned)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Objectif 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Réalisé à ce jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalActual)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercent((totalActual / totalPlanned) * 100)} de l'objectif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Écart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                variance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {variance >= 0 ? "+" : ""}
              {formatPercent(variance)}
            </div>
            <div className="flex items-center mt-1">
              {variance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className="text-xs text-gray-500">vs budget prévu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Réalisé</CardTitle>
          <CardDescription>
            Comparaison mensuelle budget planifié et résultats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={budgetData}>
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
                tickFormatter={(value) => `${value / 1000}k€`}
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)
                }
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="planned"
                name="Budget planifié"
                fill="#94a3b8"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="actual"
                name="Réalisé"
                fill="#00876c"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation de scénarios</CardTitle>
          <CardDescription>
            Prévisions selon différents scénarios de croissance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scenarioData}>
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
                tickFormatter={(value) => `${value / 1000}k€`}
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)
                }
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pessimiste"
                name="Pessimiste"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="réaliste"
                name="Réaliste"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="optimiste"
                name="Optimiste"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories budgétaires</CardTitle>
          <CardDescription>
            Détail par catégorie de revenus et dépenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.actual / budget.planned) * 100
              const isRevenue = budget.type === "revenue"
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={
                          isRevenue
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {isRevenue ? "Revenu" : "Dépense"}
                      </Badge>
                      <span className="font-medium">{budget.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(budget.actual)} /{" "}
                        {formatCurrency(budget.planned)}
                      </div>
                      <div
                        className={`text-xs ${
                          percentage >= 100
                            ? "text-green-600"
                            : percentage >= 75
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {formatPercent(percentage)}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 100
                          ? "bg-green-600"
                          : percentage >= 75
                          ? "bg-blue-600"
                          : "bg-yellow-600"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
