"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { month: "Jan", revenue: 12500, expenses: 8200, forecast: 13000 },
  { month: "Fév", revenue: 15200, expenses: 9100, forecast: 15500 },
  { month: "Mar", revenue: 18600, expenses: 10500, forecast: 18000 },
  { month: "Avr", revenue: 16800, expenses: 9800, forecast: 17500 },
  { month: "Mai", revenue: 21400, expenses: 11200, forecast: 20000 },
  { month: "Juin", revenue: 24500, expenses: 12800, forecast: 23000 },
  { month: "Juil", revenue: 22100, expenses: 11900, forecast: 24500 },
  { month: "Août", revenue: 19800, expenses: 10600, forecast: 21000 },
  { month: "Sep", revenue: 25300, expenses: 13500, forecast: 26000 },
  { month: "Oct", revenue: 28700, expenses: 14200, forecast: 28000 },
  { month: "Nov", revenue: 31200, expenses: 15100, forecast: 30000 },
  { month: "Déc", revenue: 0, expenses: 0, forecast: 32000 },
]

export function RevenueChart() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Performance financière</CardTitle>
        <CardDescription>
          Revenus, dépenses et prévisions mensuelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00876c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00876c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenus"
              stroke="#00876c"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Dépenses"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorExpenses)"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Prévisions"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
