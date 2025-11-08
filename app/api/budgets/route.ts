import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

    // Get user's company
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: session.user.id },
      include: { company: true }
    })

    if (!companyMember) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    // Get all budgets for this company
    const budgets = await prisma.budget.findMany({
      where: { companyId: companyMember.companyId },
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

    // Get user's company
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: session.user.id }
    })

    if (!companyMember) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validatedData = budgetSchema.parse(body)

    // Create budget with categories
    const budget = await prisma.budget.create({
      data: {
        companyId: companyMember.companyId,
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
