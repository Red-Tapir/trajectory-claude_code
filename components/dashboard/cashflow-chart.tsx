"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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

interface CashflowDataPoint {
  month: string
  cashflow: number
}

export function CashflowChart() {
  const [data, setData] = useState<CashflowDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCashflowData() {
      try {
        const res = await fetch('/api/dashboard/cashflow-chart')
        if (res.ok) {
          const result = await res.json()
          setData(result.data)
        }
      } catch (error) {
        console.error('Error fetching cashflow data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCashflowData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trésorerie nette</CardTitle>
          <CardDescription>
            Flux de trésorerie mensuel (revenus - dépenses)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

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
