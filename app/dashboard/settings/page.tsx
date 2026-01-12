"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Trash2, AlertTriangle, Info, Shield, User, Building } from "lucide-react"
import { toast } from "sonner"

interface DeletionEligibility {
  canDelete: boolean
  memberships: Array<{
    organizationId: string
    organizationName: string
    role: string
    isOwner: boolean
    memberCount: number
  }>
  blockers: Array<{
    type: string
    message: string
    organizations: Array<{
      id: string
      name: string
      memberCount: number
    }>
  }>
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [eligibility, setEligibility] = useState<DeletionEligibility | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleExportData() {
    try {
      setExportLoading(true)
      toast.loading("Préparation de l'export...", { id: "export" })

      const response = await fetch("/api/user/export", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Échec de l'export")
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      a.download = filenameMatch ? filenameMatch[1] : "trajectory-data-export.json"

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Données exportées avec succès", { id: "export" })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Erreur lors de l'export des données", { id: "export" })
    } finally {
      setExportLoading(false)
    }
  }

  async function checkDeletionEligibility() {
    try {
      const response = await fetch("/api/user/delete", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Échec de la vérification")
      }

      const data = await response.json()
      setEligibility(data)
      setShowDeleteConfirm(true)
    } catch (error) {
      console.error("Check error:", error)
      toast.error("Erreur lors de la vérification")
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm(
      "⚠️ ATTENTION ⚠️\n\n" +
      "Cette action est IRRÉVERSIBLE.\n\n" +
      "Votre compte sera définitivement supprimé et vos données seront anonymisées.\n\n" +
      "Êtes-vous absolument certain de vouloir continuer ?"
    )) {
      return
    }

    try {
      setDeleteLoading(true)
      toast.loading("Suppression du compte en cours...", { id: "delete" })

      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Erreur lors de la suppression", { id: "delete" })
        return
      }

      toast.success("Compte supprimé avec succès. Déconnexion...", { id: "delete" })

      // Sign out and redirect
      setTimeout(() => {
        signOut({ callbackUrl: "/" })
      }, 2000)

    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Erreur lors de la suppression du compte", { id: "delete" })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos préférences et vos données personnelles
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Compte
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Confidentialité et données
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building className="h-4 w-4 mr-2" />
            Organisations
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>
                Vos informations personnelles et identifiants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <div className="text-sm text-muted-foreground">
                  {session?.user?.name || "Non renseigné"}
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Modification du profil</AlertTitle>
                <AlertDescription>
                  La modification des informations de profil sera disponible dans une prochaine version.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Data Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vos droits RGPD</CardTitle>
              <CardDescription>
                Conformément au Règlement Général sur la Protection des Données (RGPD),
                vous disposez de droits sur vos données personnelles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Export */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">Exporter mes données</h3>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez une copie complète de toutes vos données personnelles au format JSON.
                      Cela inclut votre profil, vos organisations, clients, factures et historique d'activité.
                    </p>
                    <div className="pt-2">
                      <Button
                        onClick={handleExportData}
                        disabled={exportLoading}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {exportLoading ? "Export en cours..." : "Télécharger mes données"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                {/* Account Deletion */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-red-600">Supprimer mon compte</h3>
                      <p className="text-sm text-muted-foreground">
                        Supprimez définitivement votre compte et anonymisez vos données.
                        <strong> Cette action est irréversible.</strong>
                      </p>

                      {!showDeleteConfirm ? (
                        <div className="pt-2">
                          <Button
                            onClick={checkDeletionEligibility}
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer mon compte
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-3 space-y-3">
                          {eligibility?.canDelete ? (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Confirmer la suppression</AlertTitle>
                              <AlertDescription>
                                Vous êtes sur le point de supprimer votre compte. Cette action est irréversible.
                                <div className="mt-3 space-y-2">
                                  <p className="font-semibold">Ce qui sera supprimé :</p>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Votre profil et informations personnelles</li>
                                    <li>Vos sessions et connexions OAuth</li>
                                    <li>Vos appartenances aux organisations</li>
                                  </ul>
                                  <p className="font-semibold mt-3">Ce qui sera conservé (anonymisé) :</p>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Les clients, factures et données d'organisation</li>
                                    <li>Les journaux d'audit (pour conformité légale)</li>
                                  </ul>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Impossible de supprimer le compte</AlertTitle>
                              <AlertDescription>
                                {eligibility?.blockers[0]?.message}
                                {eligibility?.blockers[0]?.organizations && (
                                  <div className="mt-2">
                                    <p className="font-semibold">Organisations concernées :</p>
                                    <ul className="list-disc list-inside mt-1">
                                      {eligibility.blockers[0].organizations.map(org => (
                                        <li key={org.id}>
                                          {org.name} ({org.memberCount} membres)
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex gap-2">
                            {eligibility?.canDelete && (
                              <Button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleteLoading ? "Suppression..." : "Confirmer la suppression"}
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                setShowDeleteConfirm(false)
                                setEligibility(null)
                              }}
                              variant="outline"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>En savoir plus</AlertTitle>
                <AlertDescription>
                  Pour toute question concernant vos données ou vos droits RGPD, consultez notre{" "}
                  <a href="/politique-confidentialite" className="underline">
                    politique de confidentialité
                  </a>{" "}
                  ou contactez-nous à{" "}
                  <a href="mailto:dpo@trajectory.fr" className="underline">
                    dpo@trajectory.fr
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes organisations</CardTitle>
              <CardDescription>
                Les organisations dont vous êtes membre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eligibility?.memberships && eligibility.memberships.length > 0 ? (
                  eligibility.memberships.map(membership => (
                    <div
                      key={membership.organizationId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{membership.organizationName}</div>
                        <div className="text-sm text-muted-foreground">
                          {membership.memberCount} {membership.memberCount > 1 ? "membres" : "membre"}
                        </div>
                      </div>
                      <Badge variant={membership.isOwner ? "default" : "secondary"}>
                        {membership.role}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Button onClick={checkDeletionEligibility} variant="outline" size="sm">
                      Charger mes organisations
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
