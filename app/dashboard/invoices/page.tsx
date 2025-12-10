"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Download, Send, FileText, Loader2, MoreVertical, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CreateInvoiceDialog } from "@/components/dashboard/create-invoice-dialog"
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog"

interface Invoice {
  id: string
  number: string
  client: {
    id: string
    name: string
    email: string | null
  }
  date: string
  dueDate: string
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
}

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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error("Error loading invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setDownloadingId(invoice.id)
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `facture-${invoice.number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendInvoice = async (invoice: Invoice) => {
    if (!invoice.client.email) {
      alert("Ce client n'a pas d'adresse email. Veuillez d'abord ajouter un email au client.")
      return
    }

    try {
      setSendingId(invoice.id)
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de l'envoi")
      }

      alert("Facture envoyée avec succès !")
      loadInvoices()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSendingId(null)
    }
  }

  const handleUpdateStatus = async (invoice: Invoice, newStatus: string) => {
    try {
      setUpdatingId(invoice.id)
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour")
      }

      loadInvoices()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedInvoice) return

    const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erreur lors de la suppression")
    }

    loadInvoices()
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.total, 0)
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
          <Button onClick={() => setCreateDialogOpen(true)}>
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
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              {searchQuery
                ? "Aucune facture trouvée avec cette recherche"
                : "Vous n'avez pas encore de factures"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première facture
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
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
                        {invoice.client.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(new Date(invoice.date))}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(new Date(invoice.dueDate))}
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[invoice.status]}>
                          {statusLabels[invoice.status]}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            disabled={downloadingId === invoice.id}
                            title="Télécharger PDF"
                          >
                            {downloadingId === invoice.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invoice.status === "draft" && (
                                <DropdownMenuItem 
                                  onClick={() => handleSendInvoice(invoice)}
                                  disabled={sendingId === invoice.id}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  {sendingId === invoice.id ? "Envoi..." : "Envoyer par email"}
                                </DropdownMenuItem>
                              )}
                              
                              {(invoice.status === "sent" || invoice.status === "overdue") && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(invoice, "paid")}
                                  disabled={updatingId === invoice.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Marquer comme payée
                                </DropdownMenuItem>
                              )}
                              
                              {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(invoice, "cancelled")}
                                  disabled={updatingId === invoice.id}
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                                  Annuler
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInvoice(invoice)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadInvoices}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la facture"
        description={`Êtes-vous sûr de vouloir supprimer la facture "${selectedInvoice?.number}" ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
