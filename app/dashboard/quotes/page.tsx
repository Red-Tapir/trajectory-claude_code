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
import { Plus, Search, FileText, Loader2, MoreVertical, Send, CheckCircle, XCircle, Trash2, ArrowRight } from "lucide-react"
import { CreateQuoteDialog } from "@/components/dashboard/create-quote-dialog"
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog"

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

interface Quote {
  id: string
  number: string
  date: string
  validUntil: string
  status: string
  subtotal: number
  taxAmount: number
  total: number
  notes: string | null
  client: {
    id: string
    name: string
    email: string | null
  }
  items: QuoteItem[]
  _count: {
    invoices: number
  }
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "Envoyé", variant: "default" },
  accepted: { label: "Accepté", variant: "default" },
  rejected: { label: "Refusé", variant: "destructive" },
  expired: { label: "Expiré", variant: "outline" },
  converted: { label: "Converti", variant: "default" },
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/quotes")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error("Error loading quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    setActionLoading(quoteId)
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        loadQuotes()
      } else {
        const data = await response.json()
        alert(data.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Error updating quote:", error)
      alert("Erreur lors de la mise à jour")
    } finally {
      setActionLoading(null)
    }
  }

  const handleConvertToInvoice = async (quoteId: string) => {
    setActionLoading(quoteId)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/convert`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        loadQuotes()
      } else {
        alert(data.error || "Erreur lors de la conversion")
      }
    } catch (error) {
      console.error("Error converting quote:", error)
      alert("Erreur lors de la conversion")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return

    setActionLoading(quoteToDelete.id)
    try {
      const response = await fetch(`/api/quotes/${quoteToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadQuotes()
        setDeleteDialogOpen(false)
        setQuoteToDelete(null)
      } else {
        const data = await response.json()
        alert(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting quote:", error)
      alert("Erreur lors de la suppression")
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const isExpired = (validUntil: string, status: string) => {
    if (status === "converted" || status === "accepted") return false
    return new Date(validUntil) < new Date()
  }

  const filteredQuotes = quotes.filter((quote) =>
    quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === "sent").length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    totalValue: quotes.filter(q => ["sent", "accepted"].includes(q.status)).reduce((sum, q) => sum + q.total, 0),
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Devis</h1>
          <p className="text-muted-foreground">
            Gérez vos devis et convertissez-les en factures
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total devis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Acceptés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Valeur en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un devis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun devis</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "Aucun devis ne correspond à votre recherche" : "Créez votre premier devis pour commencer"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un devis
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des devis</CardTitle>
            <CardDescription>
              {filteredQuotes.length} devis trouvé{filteredQuotes.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuotes.map((quote) => {
                const expired = isExpired(quote.validUntil, quote.status)
                const config = expired && quote.status !== "converted" 
                  ? statusConfig.expired 
                  : statusConfig[quote.status] || statusConfig.draft

                return (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{quote.number}</span>
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                          {quote._count.invoices > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {quote._count.invoices} facture{quote._count.invoices > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.client.name} • Valide jusqu&apos;au {formatDate(quote.validUntil)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(quote.total)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(quote.date)}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={actionLoading === quote.id}>
                            {actionLoading === quote.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {quote.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "sent")}>
                              <Send className="h-4 w-4 mr-2" />
                              Marquer comme envoyé
                            </DropdownMenuItem>
                          )}
                          {quote.status === "sent" && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "accepted")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer comme accepté
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "rejected")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Marquer comme refusé
                              </DropdownMenuItem>
                            </>
                          )}
                          {(quote.status === "accepted" || quote.status === "sent") && quote._count.invoices === 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Convertir en facture
                              </DropdownMenuItem>
                            </>
                          )}
                          {quote.status !== "converted" && quote._count.invoices === 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setQuoteToDelete(quote)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateQuoteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadQuotes}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteQuote}
        title="Supprimer le devis"
        description={`Êtes-vous sûr de vouloir supprimer le devis ${quoteToDelete?.number} ? Cette action est irréversible.`}
      />
    </div>
  )
}
