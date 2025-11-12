"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Euro, TrendingUp } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

type Status = "sent" | "paid" | "new" | "pending" | "success"

interface Activity {
  id: string
  type: "invoice" | "client" | "payment" | "budget"
  title: string
  description: string
  date: Date
  amount?: number
  status?: Status
}

const activities: Activity[] = [
  {
    id: "1",
    type: "invoice",
    title: "Facture #2024-045",
    description: "Envoyée à SARL Dupont",
    date: new Date(2024, 10, 5),
    amount: 2450,
    status: "sent",
  },
  {
    id: "2",
    type: "payment",
    title: "Paiement reçu",
    description: "Facture #2024-042 payée",
    date: new Date(2024, 10, 4),
    amount: 1850,
    status: "paid",
  },
  {
    id: "3",
    type: "client",
    title: "Nouveau client",
    description: "Tech Solutions ajouté au CRM",
    date: new Date(2024, 10, 3),
    status: "new",
  },
  {
    id: "4",
    type: "invoice",
    title: "Facture #2024-044",
    description: "Échéance dans 3 jours",
    date: new Date(2024, 10, 2),
    amount: 3200,
    status: "pending",
  },
  {
    id: "5",
    type: "budget",
    title: "Objectif atteint",
    description: "Revenus mensuels dépassés de 15%",
    date: new Date(2024, 10, 1),
    status: "success",
  },
]

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
                      {formatDate(activity.date)}
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
