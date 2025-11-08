"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Eye, Send, FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Invoice {
  id: string
  number: string
  client: string
  date: Date
  dueDate: Date
  amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  items: number
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "2024-045",
    client: "SARL Dupont",
    date: new Date(2024, 10, 5),
    dueDate: new Date(2024, 11, 5),
    amount: 2450,
    status: "sent",
    items: 3,
  },
  {
    id: "2",
    number: "2024-044",
    client: "Tech Solutions",
    date: new Date(2024, 10, 2),
    dueDate: new Date(2024, 10, 17),
    amount: 3200,
    status: "overdue",
    items: 5,
  },
  {
    id: "3",
    number: "2024-043",
    client: "Design Studio",
    date: new Date(2024, 9, 28),
    dueDate: new Date(2024, 10, 28),
    amount: 4100,
    status: "paid",
    items: 4,
  },
  {
    id: "4",
    number: "2024-042",
    client: "Tech Solutions",
    date: new Date(2024, 9, 25),
    dueDate: new Date(2024, 10, 10),
    amount: 1850,
    status: "paid",
    items: 2,
  },
  {
    id: "5",
    number: "2024-041",
    client: "Consulting SARL",
    date: new Date(2024, 9, 20),
    dueDate: new Date(2024, 10, 5),
    amount: 5600,
    status: "paid",
    items: 6,
  },
]

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [invoices] = useState<Invoice[]>(mockInvoices)

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
          <p className="mt-2 text-gray-600">
            Gérez vos factures conformes e-invoicing 2026
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total facturé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.length} factures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Payé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter((i) => i.status === "paid").length} factures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter((i) => i.status === "sent").length} factures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              En retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(overdueAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter((i) => i.status === "overdue").length} factures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Rechercher une facture..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
          <CardDescription>
            Liste de toutes vos factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    N° Facture
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Échéance
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Montant
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">{invoice.number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {invoice.client}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={statusColors[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === "draft" && (
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* E-invoicing Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Conformité e-invoicing 2026
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                Toutes vos factures sont créées conformément aux normes françaises
                de facturation électronique qui entreront en vigueur en 2026.
                Format Factur-X supporté.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
