import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS, PlanId } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { planId } = await req.json()

    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Ne pas permettre l'essai ou le plan gratuit via le checkout
    if (planId === 'trial') {
      return NextResponse.json(
        { error: 'Le plan essai ne peut pas être acheté' },
        { status: 400 }
      )
    }

    // Récupérer l'organisation de l'utilisateur
    const organizationMember = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        role: 'OWNER', // Seul le owner peut souscrire
      },
      include: {
        organization: true,
      },
    })

    if (!organizationMember) {
      return NextResponse.json(
        { error: 'Vous devez être propriétaire d\'une organisation pour souscrire' },
        { status: 403 }
      )
    }

    const organization = organizationMember.organization
    const plan = PLANS[planId as PlanId]

    // Créer ou récupérer le customer Stripe
    let stripeCustomerId = organization.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: organization.name,
        metadata: {
          organizationId: organization.id,
          userId: session.user.id,
        },
      })
      stripeCustomerId = customer.id

      // Mettre à jour l'organisation avec le customer ID
      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId },
      })
    }

    // Créer la session de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        organizationId: organization.id,
        userId: session.user.id,
        planId,
      },
      subscription_data: {
        trial_period_days: 14, // 14 jours d'essai gratuit
        metadata: {
          organizationId: organization.id,
          planId,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
