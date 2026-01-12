"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Loader2 } from "lucide-react"

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreate() {
    if (!name || name.trim().length < 2) {
      setError("Le nom doit contenir au moins 2 caractères")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        // Handle rate limit error specially
        if (res.status === 429) {
          setError(data.error || "Limite de création atteinte")
        } else {
          setError(data.error || 'Erreur lors de la création')
        }
        setLoading(false)
        return
      }

      // Switch to the new organization
      const switchRes = await fetch('/api/organizations/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: data.id })
      })

      if (!switchRes.ok) {
        setError('Organisation créée mais erreur lors du changement')
        setLoading(false)
        return
      }

      // Success! Close dialog and refresh
      onOpenChange(false)
      setName("")
      setError(null)
      router.refresh()

      // Redirect to dashboard with success message
      router.push('/dashboard')
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
      setLoading(false)
    }
  }

  function handleClose() {
    if (!loading) {
      onOpenChange(false)
      setName("")
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 rounded-lg p-2">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <DialogTitle className="text-xl">
              Créer une organisation
            </DialogTitle>
          </div>
          <DialogDescription>
            Créez une nouvelle organisation pour gérer vos finances séparément.
            Vous serez automatiquement propriétaire de cette organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom de l'organisation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="Mon Entreprise"
              disabled={loading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleCreate()
                }
              }}
              className="h-11"
            />
            <p className="text-xs text-gray-500">
              Ce nom apparaîtra sur vos factures et documents.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
              💡 Qu'est-ce qu'une organisation ?
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Séparez vos finances professionnelles</li>
              <li>• Invitez des membres avec différents rôles</li>
              <li>• Gérez plusieurs entreprises séparément</li>
              <li>• Changez d'organisation en un clic</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || name.trim().length < 2 || loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
