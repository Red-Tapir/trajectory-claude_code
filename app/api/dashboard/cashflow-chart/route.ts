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
        { error: "Vous n'avez pas la permission de voir les données" },
        { status: 403 }
      )
    }

    // Use scoped Prisma client
    const scoped = createPrismaScoped(organizationId)

    // Get invoices for the last 12 months
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

    const chartData = []

    // Generate data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1)
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()

      const monthStart = new Date(targetYear, targetMonth, 1)
      const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

      // Get paid invoices for this month (revenue)
      const invoices = await scoped.invoice.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          },
          status: 'paid'
        },
        select: {
          total: true
        }
      })

      // Calculate revenue
      const revenue = invoices.reduce((sum, inv) => sum + inv.total, 0)

      // For expenses, we'll use 30% of revenue as placeholder
      // In a real app, you'd have an Expense model
      const expenses = revenue * 0.3

      // Cashflow = revenue - expenses
      const cashflow = revenue - expenses

      chartData.push({
        month: monthNames[targetMonth],
        cashflow: Math.round(cashflow)
      })
    }

    return NextResponse.json({ data: chartData })

  } catch (error) {
    console.error("Error fetching cashflow chart data:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    )
  }
}
