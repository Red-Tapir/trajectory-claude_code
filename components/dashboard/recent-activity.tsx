"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Euro, TrendingUp, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

type Status = "sent" | "paid" | "new" | "pending" | "success"

interface Activity {
  id: string
  type: "invoice" | "client" | "payment" | "budget"
  title: string
  description: string
  date: string | Date
  amount?: number
  status?: Status
}

const iconMap = {
  invoice: FileText,
  client: Users,
  payment: Euro,
  budget: TrendingUp,
}

const statusColors = {
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  new: "bg-purple-100 text-purple-800",
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800"
} as const;

const statusLabels = {
  sent: "Envoyée",
  paid: "Payée",
  new: "Nouveau",
  pending: "En attente",
  success: "Succès",
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch('/api/dashboard/recent-activity')
        if (res.ok) {
          const result = await res.json()
          setActivities(result.activities)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Vos dernières actions et événements</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Vos dernières actions et événements</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">Aucune activité récente</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>Vos dernières actions et événements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type]
            const activityDate = typeof activity.date === 'string' ? new Date(activity.date) : activity.date
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Badge
                        variant="secondary"
                        className={statusColors[activity.status as keyof typeof statusColors]}
                      >
                        {statusLabels[activity.status]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {formatDate(activityDate)}
                    </p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
