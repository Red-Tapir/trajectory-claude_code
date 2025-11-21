import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPrismaScoped } from "@/lib/prisma-scoped"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const budgetCategorySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  type: z.enum(["revenue", "expense"]),
  planned: z.number().nonnegative("Le montant planifié doit être positif"),
  actual: z.number().default(0),
  month: z.number().min(1).max(12).optional().nullable(),
  quarter: z.number().min(1).max(4).optional().nullable(),
})

const budgetSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  year: z.number().int().min(2020).max(2100),
  type: z.enum(["monthly", "quarterly", "annual"]).default("annual"),
  status: z.enum(["active", "archived"]).default("active"),
  categories: z.array(budgetCategorySchema).min(1, "Au moins une catégorie requise"),
})

// GET all budgets
export async function GET(req: NextRequest) {
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

    // Check permission to read budgets
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "budget:read"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      )
    }

    // Get all budgets for this organization using scoped prisma
    const scoped = createPrismaScoped(organizationId)
    const budgets = await scoped.budget.findMany({
      include: {
        categories: true,
      },
      orderBy: { year: "desc" }
    })

    return NextResponse.json(budgets)

  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des budgets" },
      { status: 500 }
    )
  }
}

// POST create new budget
export async function POST(req: NextRequest) {
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

    // Check permission to create budgets
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "budget:create"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = budgetSchema.parse(body)

    // Create budget with categories using scoped prisma
    const scoped = createPrismaScoped(organizationId)
    const budget = await scoped.budget.create({
      data: {
        name: validatedData.name,
        year: validatedData.year,
        type: validatedData.type,
        status: validatedData.status,
        categories: {
          create: validatedData.categories,
        }
      },
      include: {
        categories: true,
      }
    })

    // Log audit
    await logAudit({
      organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.BUDGET_CREATED,
      resource: "budget",
      resourceId: budget.id,
      metadata: {
        name: budget.name,
        year: budget.year,
      }
    })

    return NextResponse.json(budget, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating budget:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du budget" },
      { status: 500 }
    )
  }
}
