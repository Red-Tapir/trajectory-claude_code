import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPrismaScoped } from "@/lib/prisma-scoped"
import { can } from "@/lib/permissions"

export const dynamic = 'force-dynamic'

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
        { error: "Vous n'avez pas la permission de voir les statistiques" },
        { status: 403 }
      )
    }

    // Use scoped Prisma client
    const scoped = createPrismaScoped(organizationId)

    // Fetch all invoices
    const invoices = await scoped.invoice.findMany({
      select: {
        id: true,
        total: true,
        status: true,
        date: true,
      }
    })

    // Fetch all clients
    const clients = await scoped.client.findMany({
      select: {
        id: true,
        status: true,
      }
    })

    // Current month and previous month
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const currentMonthDate = new Date(currentYear, currentMonth, 1)

    // Calculate current month stats
    const currentMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date)
      return invDate >= currentMonthDate
    })

    // Calculate previous month stats
    const previousMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date)
      return invDate >= previousMonthDate && invDate < currentMonthDate
    })

    // Revenue (paid invoices)
    const currentRevenue = currentMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    const previousRevenue = previousMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0

    // Pending invoices
    const currentPendingCount = invoices.filter(
      inv => inv.status === 'sent' || inv.status === 'overdue'
    ).length

    const previousPendingCount = previousMonthInvoices.filter(
      inv => inv.status === 'sent' || inv.status === 'overdue'
    ).length

    const pendingChange = previousPendingCount > 0
      ? ((currentPendingCount - previousPendingCount) / previousPendingCount) * 100
      : currentPendingCount > 0 ? 100 : 0

    // Active clients
    const currentActiveClients = clients.filter(
      client => client.status === 'active'
    ).length

    // For simplicity, we'll use the total active clients for both periods
    // In a real app, you'd track this over time
    const activeClientsChange = clients.length > 0 ? 0 : 0

    // Cashflow (all paid invoices)
    const cashflow = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    const previousCashflow = invoices
      .filter(inv => {
        const invDate = new Date(inv.date)
        return invDate < currentMonthDate && inv.status === 'paid'
      })
      .reduce((sum, inv) => sum + inv.total, 0)

    const cashflowChange = previousCashflow > 0
      ? ((cashflow - previousCashflow) / previousCashflow) * 100
      : cashflow > 0 ? 100 : 0

    return NextResponse.json({
      revenue: currentRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      pendingInvoices: currentPendingCount,
      pendingChange: Math.round(pendingChange * 10) / 10,
      activeClients: currentActiveClients,
      activeClientsChange: Math.round(activeClientsChange * 10) / 10,
      cashflow: cashflow,
      cashflowChange: Math.round(cashflowChange * 10) / 10,
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
}
