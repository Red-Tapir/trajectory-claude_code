import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Configuration Next.js pour désactiver le parsing du body
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Webhook handler failed: ${error.message}`)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const companyId = session.metadata?.companyId
  const planId = session.metadata?.planId

  if (!companyId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Récupérer la subscription
  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Mettre à jour l'entreprise avec le nouveau plan
  await prisma.company.update({
    where: { id: companyId },
    data: {
      plan: planId,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  // Créer l'enregistrement de subscription
  await prisma.subscription.upsert({
    where: { companyId },
    create: {
      companyId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product as string,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product as string,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  console.log(`Checkout completed for company ${companyId}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const companyId = subscription.metadata?.companyId

  if (!companyId) {
    // Essayer de trouver la companyId via le customer
    const company = await prisma.company.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    })

    if (!company) {
      console.error('Company not found for subscription update')
      return
    }
  }

  const planId = subscription.metadata?.planId || 'starter'

  await prisma.company.update({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
    data: {
      plan: planId,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    create: {
      companyId: companyId || (await getCompanyIdByCustomer(subscription.customer as string))!,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product as string,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product as string,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Rétrograder au plan trial
  await prisma.company.update({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
    data: {
      plan: 'trial',
    },
  })

  await prisma.subscription.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  })

  console.log(`Subscription deleted: ${subscription.id}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Le paiement a réussi - on pourrait envoyer un email de confirmation
  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Le paiement a échoué - on pourrait envoyer un email d'alerte
  console.log(`Payment failed for invoice: ${invoice.id}`)

  // Optionnel : suspendre l'accès après plusieurs échecs
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

  if (subscription.status === 'past_due') {
    // Envoyer un email d'avertissement
    console.log('Subscription is past due - sending warning email')
  }
}

async function getCompanyIdByCustomer(customerId: string): Promise<string | null> {
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  })
  return company?.id || null
}
