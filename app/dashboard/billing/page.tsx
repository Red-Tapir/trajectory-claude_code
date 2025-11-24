'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { PLANS, formatPrice } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

interface SubscriptionData {
  company: {
    plan: string
    trialEndsAt: string | null
    stripeCustomerId: string | null
  }
  subscription: {
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
}

export default function BillingPage() {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)

  const { data: sessionData, status } = session || { data: null, status: 'loading' }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion')
    } else if (status === 'authenticated') {
      fetchSubscriptionData()
    }
  }, [status, router])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (status === 'loading' || !subscriptionData) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const currentPlan = subscriptionData.organization.plan
  const plan = PLANS[currentPlan as keyof typeof PLANS]
  const subscription = subscriptionData.subscription
  const isOnTrial = currentPlan === 'trial'
  const hasActiveSubscription = subscription && subscription.status === 'active'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Facturation et abonnement</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement et vos informations de paiement
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Plan actuel */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Plan actuel</h2>
              <p className="text-muted-foreground text-sm">Votre formule d'abonnement</p>
            </div>
            <Badge variant={isOnTrial ? 'secondary' : 'default'}>
              {plan?.name}
            </Badge>
          </div>

          <div className="space-y-3">
            {plan && (
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Prix</span>
                <span className="text-2xl font-bold">
                  {isOnTrial ? 'Gratuit' : `${formatPrice(plan.price)}/mois`}
                </span>
              </div>
            )}

            {isOnTrial && subscriptionData.organization.trialEndsAt && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Essai gratuit jusqu'au{' '}
                  {new Date(subscriptionData.organization.trialEndsAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            {subscription && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    {subscription.status === 'active' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    Statut
                  </span>
                  <span className="font-medium capitalize">{subscription.status}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Prochaine facturation
                  </span>
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>Votre abonnement sera annulé à la fin de la période en cours</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 space-y-2">
            {isOnTrial && (
              <Button onClick={handleUpgrade} className="w-full">
                Choisir un plan
              </Button>
            )}
            {hasActiveSubscription && (
              <Button
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? 'Chargement...' : 'Gérer l\'abonnement'}
              </Button>
            )}
          </div>
        </Card>

        {/* Limites du plan */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Limites de votre plan</h2>
            <p className="text-muted-foreground text-sm">Utilisation actuelle</p>
          </div>

          {plan && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Clients</span>
                  <span className="text-sm font-medium">
                    {plan.limits.clients === -1 ? 'Illimité' : `Max ${plan.limits.clients}`}
                  </span>
                </div>
                {plan.limits.clients !== -1 && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '40%' }} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Factures</span>
                  <span className="text-sm font-medium">
                    {plan.limits.invoices === -1 ? 'Illimité' : `Max ${plan.limits.invoices}/mois`}
                  </span>
                </div>
                {plan.limits.invoices !== -1 && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '25%' }} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Utilisateurs</span>
                  <span className="text-sm font-medium">
                    {plan.limits.users === -1 ? 'Illimité' : `Max ${plan.limits.users}`}
                  </span>
                </div>
                {plan.limits.users !== -1 && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '100%' }} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Stockage</span>
                  <span className="text-sm font-medium">{plan.limits.storage} MB</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          )}

          {isOnTrial && (
            <div className="mt-6">
              <Button onClick={handleUpgrade} variant="outline" className="w-full">
                Passer à un plan supérieur
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Fonctionnalités du plan */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Fonctionnalités incluses</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {plan?.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
