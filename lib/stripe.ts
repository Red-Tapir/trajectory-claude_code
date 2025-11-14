import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

// Initialize Stripe with the latest API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

// Plans de tarification Trajectory
export const PLANS = {
  trial: {
    name: 'Essai gratuit',
    description: '14 jours d\'essai gratuit - Toutes les fonctionnalités',
    price: 0,
    priceId: '', // Pas de price ID pour l'essai
    features: [
      'Toutes les fonctionnalités Pro',
      'Essai de 14 jours',
      'Sans engagement',
      'Sans carte bancaire',
    ],
    limits: {
      clients: 10,
      invoices: 20,
      users: 1,
      storage: 100, // MB
    },
  },
  starter: {
    name: 'Starter',
    description: 'Parfait pour les freelances et micro-entreprises',
    price: 29,
    currency: 'EUR',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_STARTER || '',
    productId: process.env.STRIPE_PRODUCT_ID_STARTER || '',
    features: [
      '50 clients maximum',
      '100 factures par mois',
      '1 utilisateur',
      'Génération de PDF',
      'Envoi d\'emails automatique',
      'Dashboard et rapports',
      'Support email',
    ],
    limits: {
      clients: 50,
      invoices: 100,
      users: 1,
      storage: 500, // MB
    },
  },
  pro: {
    name: 'Pro',
    description: 'Pour les PME en croissance',
    price: 79,
    currency: 'EUR',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_PRO || '',
    productId: process.env.STRIPE_PRODUCT_ID_PRO || '',
    popular: true,
    features: [
      'Clients illimités',
      'Factures illimitées',
      '5 utilisateurs',
      'Toutes les fonctionnalités Starter',
      'Devis et avoirs',
      'Factures récurrentes',
      'Multi-devises',
      'Intégrations (Zapier)',
      'Support prioritaire',
    ],
    limits: {
      clients: -1, // illimité
      invoices: -1, // illimité
      users: 5,
      storage: 5000, // MB (5GB)
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Pour les grandes entreprises et cabinets comptables',
    price: 199,
    currency: 'EUR',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    productId: process.env.STRIPE_PRODUCT_ID_ENTERPRISE || '',
    features: [
      'Tout illimité',
      'Utilisateurs illimités',
      'Multi-entreprises',
      'Toutes les fonctionnalités Pro',
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
