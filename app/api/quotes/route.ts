import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkPermission } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"

const createQuoteSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  date: z.string().optional(),
  validUntil: z.string().min(1, "Date de validité requise"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description requise"),
    quantity: z.number().min(0.01, "Quantité invalide"),
    unitPrice: z.number().min(0, "Prix invalide"),
    taxRate: z.number().min(0).max(100).default(20),
  })).min(1, "Au moins un article requis"),
})

// GET /api/quotes - List all quotes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const hasPermission = await checkPermission(
      session.user.id,
      session.user.organization?.id,
      "quote",
      "read"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")

    const quotes = await prisma.quote.findMany({
      where: {
        organizationId: session.user.organization?.id,
        ...(status && { status }),
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        _count: {
          select: {
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des devis" },
      { status: 500 }
    )
  }
}

// POST /api/quotes - Create a new quote
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const hasPermission = await checkPermission(
      session.user.id,
      session.user.organization?.id,
      "quote",
      "create"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = createQuoteSchema.parse(body)

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        organizationId: session.user.organization?.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 })
    }

    // Generate quote number (DEV-YYYY-XXXX format)
    const year = new Date().getFullYear()
    const lastQuote = await prisma.quote.findFirst({
      where: {
        organizationId: session.user.organization?.id,
        number: { startsWith: `DEV-${year}-` },
      },
      orderBy: { number: "desc" },
    })

    let nextNumber = 1
    if (lastQuote) {
      const lastNumber = parseInt(lastQuote.number.split("-")[2])
      nextNumber = lastNumber + 1
    }
    const quoteNumber = `DEV-${year}-${nextNumber.toString().padStart(4, "0")}`

    // Calculate totals
    const items = validatedData.items.map((item) => {
      const total = item.quantity * item.unitPrice
      return { ...item, total }
    })

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxRate = items[0]?.taxRate || 20
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        organizationId: session.user.organization?.id,
        clientId: validatedData.clientId,
        number: quoteNumber,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        validUntil: new Date(validatedData.validUntil),
        status: "draft",
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: validatedData.notes,
        terms: validatedData.terms,
        items: {
          create: items,
        },
      },
      include: {
        client: true,
        items: true,
      },
    })

    // Create audit log
    await logAudit({
      organizationId: session.user.organization?.id,
      userId: session.user.id,
      action: "quote.created",
      resource: "quote",
      resourceId: quote.id,
      metadata: { quoteNumber, clientName: client.name, total },
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating quote:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du devis" },
      { status: 500 }
    )
  }
}
