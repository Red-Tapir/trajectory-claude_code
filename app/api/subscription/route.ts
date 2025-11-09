import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer l'entreprise de l'utilisateur
    const companyMember = await prisma.companyMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        company: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!companyMember) {
      return NextResponse.json(
        { error: 'Aucune entreprise trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      company: {
        plan: companyMember.company.plan,
        trialEndsAt: companyMember.company.trialEndsAt,
        stripeCustomerId: companyMember.company.stripeCustomerId,
      },
      subscription: companyMember.company.subscription,
    })
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}
