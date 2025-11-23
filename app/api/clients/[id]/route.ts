import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const clientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional(),
  siret: z.string().optional().nullable(),
  type: z.enum(["individual", "company"]).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "prospect"]).optional(),
})

// GET single client
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          orderBy: { date: "desc" },
        },
        deals: {
          orderBy: { createdAt: "desc" },
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      )
    }

    // Verify user has access to this client's organization
    const hasPermission = await can(
      session.user.id,
      client.organizationId,
      "client:read"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    return NextResponse.json(client)

  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
      { status: 500 }
    )
  }
}

// PUT update client
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      )
    }

    // Verify user has permission to update clients
    const hasPermission = await can(
      session.user.id,
      client.organizationId,
      "client:update"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = clientSchema.parse(body)

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: validatedData
    })

    // Log audit
    await logAudit({
      organizationId: client.organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.CLIENT_UPDATED,
      resource: "client",
      resourceId: client.id,
      metadata: {
        changes: validatedData
      }
    })

    return NextResponse.json(updatedClient)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du client" },
      { status: 500 }
    )
  }
}

// DELETE client
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        invoices: true
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      )
    }

    // Verify user has permission to delete clients
    const hasPermission = await can(
      session.user.id,
      client.organizationId,
      "client:delete"
    )

    if (!hasPermission) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Check if client has invoices
    if (client.invoices.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un client avec des factures. Veuillez d'abord supprimer les factures associées." },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id: params.id }
    })

    // Log audit
    await logAudit({
      organizationId: client.organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.CLIENT_DELETED,
      resource: "client",
      resourceId: client.id,
      metadata: {
        name: client.name
      }
    })

    return NextResponse.json({ message: "Client supprimé avec succès" })

  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 }
    )
  }
}
