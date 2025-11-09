import { prisma } from '@/lib/prisma'
import { canPerformAction } from '@/lib/stripe'

/**
 * Vérifie si l'entreprise peut effectuer une action en fonction de son plan
 */
export async function checkPlanLimit(
  companyId: string,
  action: 'create_client' | 'create_invoice' | 'add_user'
): Promise<{ allowed: boolean; message?: string; currentPlan?: string }> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        plan: true,
        trialEndsAt: true,
      },
    })

    if (!company) {
      return {
        allowed: false,
        message: 'Entreprise non trouvée',
      }
    }

    // Vérifier si l'essai est expiré
    if (company.plan === 'trial' && company.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(company.trialEndsAt)

      if (now > trialEnd) {
        return {
          allowed: false,
          message: 'Votre essai gratuit est expiré. Veuillez souscrire à un plan pour continuer.',
          currentPlan: company.plan,
        }
      }
    }

    // Compter les ressources existantes
    let currentCount = 0

    switch (action) {
      case 'create_client':
        currentCount = await prisma.client.count({
          where: { companyId },
        })
        break
      case 'create_invoice':
        // Compter les factures du mois en cours
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        currentCount = await prisma.invoice.count({
          where: {
            companyId,
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        })
        break
      case 'add_user':
        currentCount = await prisma.companyMember.count({
          where: { companyId },
        })
        break
    }

    const result = canPerformAction(company.plan, action, currentCount)

    return {
      ...result,
      currentPlan: company.plan,
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
export async function hasActiveSubscription(companyId: string): Promise<boolean> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
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

    if (!company) {
      return false
    }

    // Si en essai et pas expiré
    if (company.plan === 'trial' && company.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(company.trialEndsAt)
      if (now <= trialEnd) {
        return true
      }
    }

    // Si abonnement payant actif
    if (company.subscription && company.subscription.status === 'active') {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking active subscription:', error)
    return false
  }
}
