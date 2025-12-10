import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer l'organisation de l'utilisateur
    const organizationMember = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          include: {
            subscription: true,
            _count: {
              select: {
                clients: true,
                invoices: true,
                members: true,
              }
            }
          },
        },
      },
    })

    if (!organizationMember) {
      return NextResponse.json(
        { error: 'Aucune organisation trouvée' },
        { status: 404 }
      )
    }

    // Count invoices for the current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const invoicesThisMonth = await prisma.invoice.count({
      where: {
        organizationId: organizationMember.organization.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    return NextResponse.json({
      organization: {
        plan: organizationMember.organization.plan,
        trialEndsAt: organizationMember.organization.trialEndsAt,
        stripeCustomerId: organizationMember.organization.stripeCustomerId,
      },
      subscription: organizationMember.organization.subscription,
      usage: {
        clients: organizationMember.organization._count.clients,
        invoicesTotal: organizationMember.organization._count.invoices,
        invoicesThisMonth,
        users: organizationMember.organization._count.members,
      }
    })
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}
