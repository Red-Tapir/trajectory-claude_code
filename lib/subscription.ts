import { prisma } from '@/lib/prisma'
import { canPerformAction } from '@/lib/stripe'

/**
 * Vérifie si l'entreprise peut effectuer une action en fonction de son plan
 */
export async function checkPlanLimit(
  organizationId: string,
  action: 'create_client' | 'create_invoice' | 'add_user'
): Promise<{ allowed: boolean; message?: string; currentPlan?: string }> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        plan: true,
        trialEndsAt: true,
      },
    })

    if (!organization) {
      return {
        allowed: false,
        message: 'Organisation non trouvée',
      }
    }

    // Vérifier si l'essai est expiré
    if (organization.plan === 'trial' && organization.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(organization.trialEndsAt)

      if (now > trialEnd) {
        return {
          allowed: false,
          message: 'Votre essai gratuit est expiré. Veuillez souscrire à un plan pour continuer.',
          currentPlan: organization.plan,
        }
      }
    }

    // Compter les ressources existantes
    let currentCount = 0

    switch (action) {
      case 'create_client':
        currentCount = await prisma.client.count({
          where: { organizationId },
        })
        break
      case 'create_invoice':
        // Compter les factures du mois en cours
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        currentCount = await prisma.invoice.count({
          where: {
            organizationId,
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        })
        break
      case 'add_user':
        currentCount = await prisma.organizationMember.count({
          where: { organizationId },
        })
        break
    }

    const result = canPerformAction(organization.plan, action, currentCount)

    return {
      ...result,
      currentPlan: organization.plan,
    }
  } catch (error) {
    console.error('Error checking plan limit:', error)
    return {
      allowed: false,
      message: 'Erreur lors de la vérification des limites',
    }
  }
}

/**
 * Vérifie si l'entreprise a un abonnement actif
 */
export async function hasActiveSubscription(organizationId: string): Promise<boolean> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        plan: true,
        trialEndsAt: true,
        subscription: {
          select: {
            status: true,
          },
        },
      },
    })

    if (!organization) {
      return false
    }

    // Si en essai et pas expiré
    if (organization.plan === 'trial' && organization.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(organization.trialEndsAt)
      if (now <= trialEnd) {
        return true
      }
    }

    // Si abonnement payant actif
    if (organization.subscription && organization.subscription.status === 'active') {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking active subscription:', error)
    return false
  }
}
