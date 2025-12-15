import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkPermission } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"

const updateQuoteSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired", "converted"]).optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    taxRate: z.number().min(0).max(100).default(20),
  })).optional(),
})

// GET /api/quotes/[id] - Get a specific quote
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
      include: {
        client: true,
        items: true,
        invoices: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du devis" },
      { status: 500 }
    )
  }
}

// PUT /api/quotes/[id] - Update a quote
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const hasPermission = await checkPermission(
      session.user.id,
      session.user.organizationId,
      "quote",
      "update"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    })

    if (!existingQuote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = updateQuoteSchema.parse(body)

    let updateData: any = {}

    if (validatedData.status) {
      updateData.status = validatedData.status
    }
    if (validatedData.validUntil) {
      updateData.validUntil = new Date(validatedData.validUntil)
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }
    if (validatedData.terms !== undefined) {
      updateData.terms = validatedData.terms
    }

    // If items are provided, recalculate totals
    if (validatedData.items) {
      // Delete existing items and create new ones
      await prisma.quoteItem.deleteMany({
        where: { quoteId: params.id },
      })

      const items = validatedData.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.quantity * item.unitPrice,
      }))

      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      const taxRate = items[0]?.taxRate || 20
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      updateData = {
        ...updateData,
        subtotal,
        taxRate,
        taxAmount,
        total,
        items: {
          create: items,
        },
      }
    }

    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        items: true,
      },
    })

    await logAudit({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: "quote.updated",
      resource: "quote",
      resourceId: quote.id,
      metadata: { changes: Object.keys(validatedData) },
    })

    return NextResponse.json({ quote })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating quote:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du devis" },
      { status: 500 }
    )
  }
}

// DELETE /api/quotes/[id] - Delete a quote
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const hasPermission = await checkPermission(
      session.user.id,
      session.user.organizationId,
      "quote",
      "delete"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    // Don't allow deletion if quote has been converted to invoices
    if (quote._count.invoices > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un devis converti en facture" },
        { status: 400 }
      )
    }

    await prisma.quote.delete({
      where: { id: params.id },
    })

    await logAudit({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: "quote.deleted",
      resource: "quote",
      resourceId: params.id,
      metadata: { quoteNumber: quote.number },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quote:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du devis" },
      { status: 500 }
    )
  }
}
