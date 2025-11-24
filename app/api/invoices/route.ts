import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPrismaScoped } from "@/lib/prisma-scoped"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().positive("La quantité doit être positive"),
  unitPrice: z.number().nonnegative("Le prix unitaire doit être positif ou nul"),
  taxRate: z.number().default(20.0),
})

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  date: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().or(z.date()),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  taxRate: z.number().default(20.0),
  notes: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(["monthly", "quarterly", "yearly"]).optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "Au moins un article requis"),
})

// GET all invoices
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

    // Check permission to read invoices
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "invoice:read"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de voir les factures" },
        { status: 403 }
      )
    }

    // Use scoped Prisma client
    const scoped = createPrismaScoped(organizationId)

    // Get all invoices
    const invoices = await scoped.invoice.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: true,
      },
      orderBy: { date: "desc" }
    })

    return NextResponse.json({ invoices })

  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des factures" },
      { status: 500 }
    )
  }
}

// POST create new invoice
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

    // Check permission to create invoices
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "invoice:create"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de créer des factures" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = invoiceSchema.parse(body)

    // Convert dates if they're strings
    const date = typeof validatedData.date === 'string'
      ? new Date(validatedData.date)
      : validatedData.date
    const dueDate = typeof validatedData.dueDate === 'string'
      ? new Date(validatedData.dueDate)
      : validatedData.dueDate

    // Calculate totals
    const items = validatedData.items.map(item => {
      const total = item.quantity * item.unitPrice
      return {
        ...item,
        total,
      }
    })

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * (validatedData.taxRate / 100)
    const total = subtotal + taxAmount

    // Use scoped Prisma client
    const scoped = createPrismaScoped(organizationId)

    // Generate invoice number (simple increment, you might want a more complex logic)
    const lastInvoice = await scoped.invoice.findFirst({
      orderBy: { createdAt: "desc" }
    })

    const year = new Date().getFullYear()
    const lastNumber = lastInvoice?.number
      ? parseInt(lastInvoice.number.split('-')[1] || "0")
      : 0
    const number = `${year}-${String(lastNumber + 1).padStart(3, '0')}`

    // Create invoice with items
    const invoice = await scoped.invoice.create({
      data: {
        organizationId,
        clientId: validatedData.clientId,
        number,
        date,
        dueDate,
        status: validatedData.status,
        subtotal,
        taxRate: validatedData.taxRate,
        taxAmount,
        total,
        currency: "EUR",
        notes: validatedData.notes,
        paymentTerms: validatedData.paymentTerms,
        isRecurring: validatedData.isRecurring,
        recurringPeriod: validatedData.recurringPeriod,
        items: {
          create: items,
        }
      },
      include: {
        client: true,
        items: true,
      }
    })

    // Log audit
    await logAudit({
      organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.INVOICE_CREATED,
      resource: "invoice",
      resourceId: invoice.id,
      metadata: {
        number: invoice.number,
        clientId: invoice.clientId,
        total: invoice.total,
      },
    })

    return NextResponse.json(invoice, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating invoice:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la facture" },
      { status: 500 }
    )
  }
}
