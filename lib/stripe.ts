import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors when env vars are not set
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility
export const stripe = typeof process.env.STRIPE_SECRET_KEY !== 'undefined' && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : (null as unknown as Stripe)

// Plans de tarification Trajectory
export const PLANS = {
  core: {
    name: 'Trajectory Core',
    description: 'Facturation gratuite pour toujours',
    price: 0,
    priceId: '', // Pas de price ID pour le plan gratuit
    features: [
      'Clients illimités',
      'Devis illimités',
      'Factures illimitées',
      'Génération de PDF',
      'Envoi d\'emails',
      'Conversion devis → facture',
      'Dashboard basique',
      'Conformité e-invoicing 2026',
    ],
    limits: {
      clients: -1, // illimité
      invoices: -1, // illimité
      quotes: -1, // illimité
      users: 1,
      storage: 100, // MB
    },
  },
  trial: {
    name: 'Essai Pro',
    description: '14 jours d\'essai gratuit - Toutes les fonctionnalités Pro',
    price: 0,
    priceId: '', // Pas de price ID pour l'essai
    features: [
      'Toutes les fonctionnalités Pro',
      'Essai de 14 jours',
      'Sans engagement',
      'Sans carte bancaire',
    ],
    limits: {
      clients: -1,
      invoices: -1,
      users: 5,
      storage: 5000, // MB
    },
  },
  starter: {
    name: 'Starter',
    description: 'Parfait pour les freelances et micro-entreprises',
    price: 49,
    currency: 'EUR',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_STARTER || '',
    features: [
      'Tout de Core +',
      'CRM avancé',
      'Planification budgétaire',
      'Rapports détaillés',
      'Devis et avoirs',
      'Support email',
    ],
    limits: {
      clients: -1,
      invoices: -1,
      users: 1,
      storage: 500, // MB
    },
  },
  pro: {
    name: 'Pro',
    description: 'Pour les PME en croissance',
    price: 129,
    currency: 'EUR',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_PRO || '',
    popular: true,
    features: [
      'Tout de Starter +',
      '5 utilisateurs',
      'Factures récurrentes',
      'Multi-devises',
      'Intégrations (Zapier)',
      'Prévisions financières',
      'Support prioritaire',
    ],
    limits: {
      clients: -1,
      invoices: -1,
      users: 5,
      storage: 5000, // MB (5GB)
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Pour les grandes entreprises et cabinets comptables',
    price: 299,
    currency: 'EUR',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    features: [
      'Tout de Pro +',
      'Utilisateurs illimités',
      'Multi-entreprises',
      'SSO (SAML)',
      'API dédiée',
      'Intégration bancaire',
      'White label',
      'Support 24/7',
      'Account manager dédié',
    ],
    limits: {
      clients: -1,
      invoices: -1,
      users: -1, // illimité
      storage: 50000, // MB (50GB)
    },
  },
} as const

export type PlanId = keyof typeof PLANS

// Helper pour vérifier si une entreprise peut effectuer une action
export function canPerformAction(
  plan: string,
  action: 'create_client' | 'create_invoice' | 'add_user',
  currentCount: number
): { allowed: boolean; message?: string } {
  const planConfig = PLANS[plan as PlanId]

  if (!planConfig) {
    return { allowed: false, message: 'Plan invalide' }
  }

  let limit: number
  let resourceName: string

  switch (action) {
    case 'create_client':
      limit = planConfig.limits.clients
      resourceName = 'clients'
      break
    case 'create_invoice':
      limit = planConfig.limits.invoices
      resourceName = 'factures'
      break
    case 'add_user':
      limit = planConfig.limits.users
      resourceName = 'utilisateurs'
      break
    default:
      return { allowed: false, message: 'Action inconnue' }
  }

  // -1 signifie illimité
  if (limit === -1) {
    return { allowed: true }
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      message: `Limite de ${limit} ${resourceName} atteinte. Passez à un plan supérieur pour continuer.`,
    }
  }

  return { allowed: true }
}

// Helper pour formater le prix
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}
