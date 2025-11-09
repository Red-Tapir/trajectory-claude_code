'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { PLANS, formatPrice } from '@/lib/stripe'

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/connexion?redirect=/pricing')
      return
    }

    if (planId === 'trial') {
      router.push('/inscription')
      return
    }

    setLoading(planId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
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
      console.error('Error creating checkout session:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement pendant 14 jours. Sans carte bancaire. Annulez à tout moment.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Trial Plan */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border-2 border-border hover:border-primary/50 transition-colors">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.trial.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {PLANS.trial.description}
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">Gratuit</span>
                <span className="text-muted-foreground ml-2">14 jours</span>
              </div>
            </div>

            <Button
              onClick={() => handleSubscribe('trial')}
              disabled={loading !== null}
              className="w-full mb-6"
              variant="outline"
            >
              {loading === 'trial' ? 'Chargement...' : 'Commencer gratuitement'}
            </Button>

            <ul className="space-y-3">
              {PLANS.trial.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Starter Plan */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border-2 border-border hover:border-primary/50 transition-colors">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.starter.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {PLANS.starter.description}
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">
                  {formatPrice(PLANS.starter.price)}
                </span>
                <span className="text-muted-foreground ml-2">/mois</span>
              </div>
            </div>

            <Button
              onClick={() => handleSubscribe('starter')}
              disabled={loading !== null}
              className="w-full mb-6"
              variant="outline"
            >
              {loading === 'starter' ? 'Chargement...' : 'Choisir Starter'}
            </Button>

            <ul className="space-y-3">
              {PLANS.starter.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan - Popular */}
          <div className="bg-primary text-primary-foreground rounded-2xl shadow-2xl p-8 border-2 border-primary relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Le plus populaire
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.pro.name}</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                {PLANS.pro.description}
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">
                  {formatPrice(PLANS.pro.price)}
                </span>
                <span className="text-primary-foreground/80 ml-2">/mois</span>
              </div>
            </div>

            <Button
              onClick={() => handleSubscribe('pro')}
              disabled={loading !== null}
              className="w-full mb-6 bg-background text-foreground hover:bg-background/90"
            >
              {loading === 'pro' ? 'Chargement...' : 'Choisir Pro'}
            </Button>

            <ul className="space-y-3">
              {PLANS.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border-2 border-border hover:border-primary/50 transition-colors">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.enterprise.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {PLANS.enterprise.description}
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">
                  {formatPrice(PLANS.enterprise.price)}
                </span>
                <span className="text-muted-foreground ml-2">/mois</span>
              </div>
            </div>

            <Button
              onClick={() => handleSubscribe('enterprise')}
              disabled={loading !== null}
              className="w-full mb-6"
            >
              {loading === 'enterprise' ? 'Chargement...' : 'Choisir Enterprise'}
            </Button>

            <ul className="space-y-3">
              {PLANS.enterprise.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">
                L'essai gratuit nécessite-t-il une carte bancaire ?
              </h3>
              <p className="text-muted-foreground text-sm">
                Non ! Vous pouvez essayer Trajectory gratuitement pendant 14 jours sans avoir à entrer
                de carte bancaire. Vous ne paierez qu'après avoir choisi un plan payant.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-muted-foreground text-sm">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment.
                Les changements sont calculés au prorata.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Comment annuler mon abonnement ?</h3>
              <p className="text-muted-foreground text-sm">
                Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
                Vous garderez l'accès jusqu'à la fin de votre période de facturation.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Proposez-vous des remises pour les paiements annuels ?</h3>
              <p className="text-muted-foreground text-sm">
                Oui ! Contactez-nous à contact@trajectory.fr pour obtenir une remise de 20%
                sur les paiements annuels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
