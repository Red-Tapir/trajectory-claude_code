import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer l'entreprise de l'utilisateur
    const companyMember = await prisma.companyMember.findFirst({
      where: {
        userId: session.user.id,
        role: 'owner', // Seul le owner peut gérer l'abonnement
      },
      include: {
        company: true,
      },
    })

    if (!companyMember?.company?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif' },
        { status: 404 }
      )
    }

    // Créer une session du portail client Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: companyMember.company.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'accès au portail de facturation' },
      { status: 500 }
    )
  }
}
