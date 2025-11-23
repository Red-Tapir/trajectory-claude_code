import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const invoiceUpdateSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  notes: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
})

// GET single invoice
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        items: true,
        organization: {
          select: {
            name: true,
            siret: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            phone: true,
            email: true,
            logo: true,
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      )
    }

    // Verify user has permission to read invoices
    const hasPermission = await can(
      session.user.id,
      invoice.organizationId,
      "invoice:read"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    return NextResponse.json(invoice)

  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la facture" },
      { status: 500 }
    )
  }
}

// PUT update invoice
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      )
    }

    // Verify user has permission to update invoices
    const hasPermission = await can(
      session.user.id,
      invoice.organizationId,
      "invoice:update"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = invoiceUpdateSchema.parse(body)

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        client: true,
        items: true,
      }
    })

    // Log audit
    await logAudit({
      organizationId: invoice.organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.INVOICE_UPDATED,
      resource: "invoice",
      resourceId: invoice.id,
      metadata: {
        changes: validatedData
      }
    })

    return NextResponse.json(updatedInvoice)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la facture" },
      { status: 500 }
    )
  }
}

// DELETE invoice
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      )
    }

    // Verify user has permission to delete invoices
    const hasPermission = await can(
      session.user.id,
      invoice.organizationId,
      "invoice:delete"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Don't allow deleting paid invoices
    if (invoice.status === "paid") {
      return NextResponse.json(
        { error: "Impossible de supprimer une facture payée" },
        { status: 400 }
      )
    }

    // Delete invoice and its items (cascade)
    await prisma.invoice.delete({
      where: { id: params.id }
    })

    // Log audit
    await logAudit({
      organizationId: invoice.organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.INVOICE_DELETED,
      resource: "invoice",
      resourceId: invoice.id,
      metadata: {
        number: invoice.number
      }
    })

    return NextResponse.json({ message: "Facture supprimée avec succès" })

  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la facture" },
      { status: 500 }
    )
  }
}
