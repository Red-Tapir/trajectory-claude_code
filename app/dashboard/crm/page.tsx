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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Mail, Phone, MapPin, Building, Loader2, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { CreateClientDialog } from "@/components/dashboard/create-client-dialog"
import { EditClientDialog } from "@/components/dashboard/edit-client-dialog"
import { ClientDetailDialog } from "@/components/dashboard/client-detail-dialog"
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  type: string
  status: "active" | "prospect" | "inactive"
  address: string | null
  city: string | null
  postalCode: string | null
  siret: string | null
  notes: string | null
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  prospect: "bg-blue-100 text-blue-800",
  inactive: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  active: "Actif",
  prospect: "Prospect",
  inactive: "Inactif",
}

export default function CRMPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected client for operations
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleViewClient = (client: Client) => {
    setSelectedClientId(client.id)
    setDetailDialogOpen(true)
  }

  const handleEditClient = (client: any) => {
    setSelectedClient(client)
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleDeleteClient = (client: any) => {
    setSelectedClient(client)
    setDetailDialogOpen(false)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedClient) return

    const response = await fetch(`/api/clients/${selectedClient.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erreur lors de la suppression")
    }

    loadClients()
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Clients & CRM</h1>
          <p className="mt-2 text-gray-600">
            Gérez vos clients et votre pipeline commercial
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clients actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {clients.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Prospects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {clients.filter((c) => c.status === "prospect").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {clients.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inactifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {clients.filter((c) => c.status === "inactive").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Rechercher un client..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              {searchQuery
                ? "Aucun client trouvé avec cette recherche"
                : "Vous n'avez pas encore de clients"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleViewClient(client)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{client.name}</CardTitle>
                    {client.type === "company" && (
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-3 w-3 mr-1" />
                        Entreprise
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[client.status]}>
                      {statusLabels[client.status]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewClient(client); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeleteClient(client); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      {client.phone}
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      {client.city}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateClientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadClients}
      />

      <EditClientDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadClients}
      />

      <ClientDetailDialog
        clientId={selectedClientId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer le client"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedClient?.name}" ? Cette action est irréversible. Les clients ayant des factures ne peuvent pas être supprimés.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
