import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkPermission } from "@/lib/permissions"
import { logAudit } from "@/lib/audit"

// POST /api/quotes/[id]/convert - Convert quote to invoice
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check both quote and invoice permissions
    const hasQuotePermission = await checkPermission(
      session.user.id,
      session.user.organization?.id,
      "quote",
      "update"
    )
    const hasInvoicePermission = await checkPermission(
      session.user.id,
      session.user.organization?.id,
      "invoice",
      "create"
    )

    if (!hasQuotePermission || !hasInvoicePermission) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organization?.id,
      },
      include: {
        client: true,
        items: true,
      },
    })

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    // Check quote status - only accepted quotes should be converted
    if (quote.status !== "accepted" && quote.status !== "sent") {
      return NextResponse.json(
        { error: "Seuls les devis acceptés ou envoyés peuvent être convertis en facture" },
        { status: 400 }
      )
    }

    // Generate invoice number (FAC-YYYY-XXXX format)
    const year = new Date().getFullYear()
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        organizationId: session.user.organization?.id,
        number: { startsWith: `FAC-${year}-` },
      },
      orderBy: { number: "desc" },
    })

    let nextNumber = 1
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.number.split("-")[2])
      nextNumber = lastNumber + 1
    }
    const invoiceNumber = `FAC-${year}-${nextNumber.toString().padStart(4, "0")}`

    // Calculate due date (30 days from now by default)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create invoice from quote
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: session.user.organization?.id,
        clientId: quote.clientId,
        quoteId: quote.id,
        number: invoiceNumber,
        date: new Date(),
        dueDate,
        status: "draft",
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
        currency: quote.currency,
        notes: quote.notes,
        items: {
          create: quote.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            total: item.total,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    })

    // Update quote status to converted
    await prisma.quote.update({
      where: { id: params.id },
      data: {
        status: "converted",
        convertedAt: new Date(),
      },
    })

    // Create audit logs
    await logAudit({
      organizationId: session.user.organization?.id,
      userId: session.user.id,
      action: "quote.converted",
      resource: "quote",
      resourceId: quote.id,
      metadata: { 
        quoteNumber: quote.number, 
        invoiceNumber,
        invoiceId: invoice.id,
      },
    })

    await logAudit({
      organizationId: session.user.organization?.id,
      userId: session.user.id,
      action: "invoice.created",
      resource: "invoice",
      resourceId: invoice.id,
      metadata: { 
        invoiceNumber, 
        fromQuote: quote.number,
        clientName: quote.client.name,
        total: invoice.total,
      },
    })

    return NextResponse.json({ 
      invoice,
      message: `Devis ${quote.number} converti en facture ${invoiceNumber}`,
    }, { status: 201 })
  } catch (error) {
    console.error("Error converting quote to invoice:", error)
    return NextResponse.json(
      { error: "Erreur lors de la conversion du devis" },
      { status: 500 }
    )
  }
}
