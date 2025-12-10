"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Building, Save, CheckCircle } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
  siret: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  country: string
  phone: string | null
  email: string | null
  logo: string | null
}

export default function SettingsPage() {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    siret: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    phone: "",
    email: "",
  })

  const { status } = session || { status: 'loading' }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion')
    } else if (status === 'authenticated') {
      loadOrganization()
    }
  }, [status, router])

  const loadOrganization = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/organizations/current")
      if (response.ok) {
        const data = await response.json()
        setOrganization(data)
        setFormData({
          name: data.name || "",
          siret: data.siret || "",
          address: data.address || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          country: data.country || "France",
          phone: data.phone || "",
          email: data.email || "",
        })
      }
    } catch (error) {
      console.error("Error loading organization:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch("/api/organizations/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la sauvegarde")
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-gray-600">
          Configurez les informations de votre entreprise
        </p>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informations de l'entreprise
          </CardTitle>
          <CardDescription>
            Ces informations apparaîtront sur vos factures et documents officiels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ma Société SARL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  placeholder="123 456 789 00012"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="12 rue de la Paix"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="France"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@masociete.fr"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              {saved && (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Enregistré
                </span>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Informations légales
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                Ces informations sont obligatoires pour la conformité de vos factures
                avec la réglementation française. Le SIRET et l'adresse complète
                doivent figurer sur tous les documents officiels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
