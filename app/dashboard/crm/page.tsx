"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, MapPin, Building } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: "active" | "prospect" | "inactive"
  totalRevenue: number
  lastContact: Date
  invoicesCount: number
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.fr",
    phone: "+33 6 12 34 56 78",
    company: "SARL Dupont",
    status: "active",
    totalRevenue: 15400,
    lastContact: new Date(2024, 10, 5),
    invoicesCount: 8,
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie@techsolutions.fr",
    phone: "+33 6 23 45 67 89",
    company: "Tech Solutions",
    status: "active",
    totalRevenue: 28700,
    lastContact: new Date(2024, 10, 3),
    invoicesCount: 12,
  },
  {
    id: "3",
    name: "Pierre Lefebvre",
    email: "p.lefebvre@consulting.fr",
    phone: "+33 6 34 56 78 90",
    company: "Lefebvre Consulting",
    status: "prospect",
    totalRevenue: 0,
    lastContact: new Date(2024, 10, 1),
    invoicesCount: 0,
  },
  {
    id: "4",
    name: "Sophie Bernard",
    email: "sophie.b@designstudio.fr",
    phone: "+33 6 45 67 89 01",
    company: "Design Studio",
    status: "active",
    totalRevenue: 42300,
    lastContact: new Date(2024, 9, 28),
    invoicesCount: 15,
  },
]

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
  const [clients] = useState<Client[]>(mockClients)

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <Button>
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
              CA total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                clients.reduce((sum, c) => sum + c.totalRevenue, 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Factures émises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {clients.reduce((sum, c) => sum + c.invoicesCount, 0)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="hover:shadow-lg transition-all cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building className="h-3 w-3 mr-1" />
                    {client.company}
                  </CardDescription>
                </div>
                <Badge className={statusColors[client.status]}>
                  {statusLabels[client.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  {client.phone}
                </div>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chiffre d'affaires</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(client.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Factures</span>
                  <span className="font-semibold">{client.invoicesCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernier contact</span>
                  <span className="text-gray-700">
                    {formatDate(client.lastContact)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
