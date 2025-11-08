"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"

const data = [
  { month: "Jan", cashflow: 4300 },
  { month: "Fév", cashflow: 6100 },
  { month: "Mar", cashflow: 8100 },
  { month: "Avr", cashflow: 7000 },
  { month: "Mai", cashflow: 10200 },
  { month: "Juin", cashflow: 11700 },
  { month: "Juil", cashflow: 10200 },
  { month: "Août", cashflow: 9200 },
  { month: "Sep", cashflow: 11800 },
  { month: "Oct", cashflow: 14500 },
  { month: "Nov", cashflow: 16100 },
  { month: "Déc", cashflow: 12000 },
]

export function CashflowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trésorerie nette</CardTitle>
        <CardDescription>
          Flux de trésorerie mensuel (revenus - dépenses)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
            <ReferenceLine y={0} stroke="#000" />
            <Bar
              dataKey="cashflow"
              name="Trésorerie"
              fill="#00876c"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
