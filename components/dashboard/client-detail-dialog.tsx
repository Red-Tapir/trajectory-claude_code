"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, Mail, Phone, MapPin, Building, FileText, 
  Euro, Calendar, Edit, Trash2, X 
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Invoice {
  id: string
  number: string
  date: string
  total: number
  status: string
}

interface ClientDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  country: string
  siret: string | null
  type: string
  status: string
  notes: string | null
  createdAt: string
  invoices: Invoice[]
}

interface ClientDetailDialogProps {
  clientId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (client: ClientDetail) => void
  onDelete: (client: ClientDetail) => void
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  prospect: "bg-blue-100 text-blue-800",
  inactive: "bg-gray-100 text-gray-800",
}

const statusLabels: Record<string, string> = {
  active: "Actif",
  prospect: "Prospect",
  inactive: "Inactif",
}

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const invoiceStatusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
}

export function ClientDetailDialog({ 
  clientId, 
  open, 
  onOpenChange,
  onEdit,
  onDelete
}: ClientDetailDialogProps) {
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<ClientDetail | null>(null)

  useEffect(() => {
    if (open && clientId) {
      loadClient()
    }
  }, [open, clientId])

  const loadClient = async () => {
    if (!clientId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      }
    } catch (error) {
      console.error("Error loading client:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalInvoiced = client?.invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0
  const paidInvoices = client?.invoices?.filter(inv => inv.status === "paid") || []
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const pendingAmount = totalInvoiced - totalPaid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Détail du client</DialogTitle>
            {client && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(client)}>
                  <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : client ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {client.type === "company" && (
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      Entreprise
                    </span>
                  )}
                  <Badge className={statusColors[client.status]}>
                    {statusLabels[client.status]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`tel:${client.phone}`} className="hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
                {(client.address || client.city) && (
                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      {client.address && <div>{client.address}</div>}
                      {(client.postalCode || client.city) && (
                        <div>{[client.postalCode, client.city].filter(Boolean).join(" ")}</div>
                      )}
                      {client.country && <div>{client.country}</div>}
                    </div>
                  </div>
                )}
                {client.siret && (
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    SIRET: {client.siret}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
                  <p className="text-xs text-muted-foreground">Total facturé</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
                  <p className="text-xs text-muted-foreground">Total payé</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </CardContent>
              </Card>
            </div>

            {/* Invoices */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Factures ({client.invoices?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.invoices && client.invoices.length > 0 ? (
                  <div className="space-y-2">
                    {client.invoices.slice(0, 5).map((invoice) => (
                      <div 
                        key={invoice.id} 
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{invoice.number}</span>
                          <Badge className={invoiceStatusColors[invoice.status]}>
                            {invoiceStatusLabels[invoice.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {formatDate(new Date(invoice.date))}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(invoice.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {client.invoices.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        Et {client.invoices.length - 5} autres factures...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune facture pour ce client
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Meta */}
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Client depuis le {formatDate(new Date(client.createdAt))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Client non trouvé
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
