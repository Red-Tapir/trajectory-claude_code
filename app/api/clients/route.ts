import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkPlanLimit } from "@/lib/subscription"

const clientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().default("France"),
  siret: z.string().optional().nullable(),
  type: z.enum(["individual", "company"]).default("individual"),
  notes: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "prospect"]).default("active"),
})

// GET all clients
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

    // Get all clients for this company with invoice count and total revenue
    const clients = await prisma.client.findMany({
      where: { companyId: companyMember.companyId },
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Transform data to include computed fields
    const clientsWithStats = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      country: client.country,
      siret: client.siret,
      type: client.type,
      notes: client.notes,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      invoicesCount: client.invoices.length,
      totalRevenue: client.invoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0),
      lastContact: client.updatedAt,
    }))

    return NextResponse.json(clientsWithStats)

  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    )
  }
}

// POST create new client
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

    // Vérifier les limites du plan
    const limitCheck = await checkPlanLimit(companyMember.companyId, 'create_client')

    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, upgradeTo: '/pricing' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        companyId: companyMember.companyId,
      }
    })

    return NextResponse.json(client, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    )
  }
}
