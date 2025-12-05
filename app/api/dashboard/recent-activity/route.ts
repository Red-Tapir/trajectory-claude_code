import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPrismaScoped } from "@/lib/prisma-scoped"
import { can } from "@/lib/permissions"

export const dynamic = 'force-dynamic'

type ActivityType = "invoice" | "client" | "payment" | "budget"
type ActivityStatus = "sent" | "paid" | "new" | "pending" | "success"

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  date: Date
  amount?: number
  status?: ActivityStatus
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = session.user.currentOrganizationId

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      )
    }

    // Check permission
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "organization:read"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de voir l'activité" },
        { status: 403 }
      )
    }

    // Use scoped Prisma client
    const scoped = createPrismaScoped(organizationId)

    const activities: Activity[] = []

    // Get recent invoices (last 5)
    const recentInvoices = await scoped.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            name: true
          }
        }
      }
    })

    // Add invoice activities
    recentInvoices.forEach(invoice => {
      // Invoice creation
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        title: `Facture #${invoice.number}`,
        description: `Envoyée à ${invoice.client.name}`,
        date: invoice.createdAt,
        amount: invoice.total,
        status: invoice.status === 'paid' ? 'paid' : invoice.status === 'sent' ? 'sent' : 'pending'
      })

      // If paid, add payment activity
      if (invoice.status === 'paid') {
        activities.push({
          id: `payment-${invoice.id}`,
          type: 'payment',
          title: 'Paiement reçu',
          description: `Facture #${invoice.number} payée`,
          date: invoice.updatedAt,
          amount: invoice.total,
          status: 'paid'
        })
      }
    })

    // Get recent clients (last 3)
    const recentClients = await scoped.client.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        status: true
      }
    })

    // Add client activities
    recentClients.forEach(client => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        title: 'Nouveau client',
        description: `${client.name} ajouté au CRM`,
        date: client.createdAt,
        status: 'new'
      })
    })

    // Sort all activities by date (most recent first) and take top 5
    const sortedActivities = activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)

    return NextResponse.json({ activities: sortedActivities })

  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'activité" },
      { status: 500 }
    )
  }
}
