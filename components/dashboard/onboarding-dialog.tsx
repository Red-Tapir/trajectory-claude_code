"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Building, FileText, Users, CheckCircle2, ArrowRight } from "lucide-react"

interface OnboardingDialogProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    siret: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  })

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setLoading(true)
      try {
        const response = await fetch("/api/organizations/current", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.companyName || undefined,
            siret: formData.siret || undefined,
            address: formData.address || undefined,
            city: formData.city || undefined,
            postalCode: formData.postalCode || undefined,
            phone: formData.phone || undefined,
            email: formData.email || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la sauvegarde")
        }

        setCurrentStep(3)
      } catch (error) {
        console.error("Error saving organization:", error)
      } finally {
        setLoading(false)
      }
    } else {
      localStorage.setItem("trajectory_onboarding_complete", "true")
      onComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem("trajectory_onboarding_complete", "true")
    onComplete()
  }

  const stepTitles = [
    "Bienvenue sur Trajectory ! 🎉",
    "Informations de votre entreprise",
    "Vous êtes prêt !"
  ]

  const stepDescriptions = [
    "Configurons votre espace de travail en quelques étapes.",
    "Ces informations apparaîtront sur vos factures.",
    "Votre espace est configuré. Commencez à créer vos premières factures."
  ]

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep === 1 && <Building className="h-6 w-6 text-primary" />}
            {currentStep === 2 && <FileText className="h-6 w-6 text-primary" />}
            {currentStep === 3 && <CheckCircle2 className="h-6 w-6 text-primary" />}
            {stepTitles[currentStep - 1]}
          </DialogTitle>
          <DialogDescription>
            {stepDescriptions[currentStep - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 my-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm font-medium">CRM intégré</p>
                  <p className="text-xs text-muted-foreground">Gérez vos clients</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm font-medium">Facturation</p>
                  <p className="text-xs text-muted-foreground">Factures conformes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Building className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm font-medium">Planification</p>
                  <p className="text-xs text-muted-foreground">Budgets & rapports</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Essai gratuit de 14 jours</strong> - 
                Toutes les fonctionnalités sont disponibles. Aucune carte bancaire requise.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Company Info */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ma Société SARL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET (optionnel)</Label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                placeholder="123 456 789 00012"
              />
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="font-medium">Votre espace est prêt !</p>
              <p className="text-sm text-muted-foreground">
                Commencez par ajouter votre premier client, puis créez votre première facture.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">1</div>
                <div>
                  <p className="text-sm font-medium">Créer un client</p>
                  <p className="text-xs text-muted-foreground">Ajoutez les infos de votre premier client</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">2</div>
                <div>
                  <p className="text-sm font-medium">Créer une facture</p>
                  <p className="text-xs text-muted-foreground">Générez votre première facture PDF</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">3</div>
                <div>
                  <p className="text-sm font-medium">Envoyer par email</p>
                  <p className="text-xs text-muted-foreground">Envoyez la facture directement à votre client</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          {currentStep < 3 ? (
            <Button variant="ghost" onClick={handleSkip}>
              Passer
            </Button>
          ) : (
            <div />
          )}
          
          <Button onClick={handleNext} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentStep === 3 ? (
              "Commencer"
            ) : (
              <>
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
