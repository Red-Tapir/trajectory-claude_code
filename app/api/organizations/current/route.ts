import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const organizationUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  siret: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  logo: z.string().optional().nullable(),
})

// GET current organization
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

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
        _count: {
          select: {
            clients: true,
            invoices: true,
            members: true,
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)

  } catch (error) {
    console.error("Error fetching organization:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'organisation" },
      { status: 500 }
    )
  }
}

// PUT update current organization
export async function PUT(req: NextRequest) {
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
      "organization:update"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier cette organisation" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = organizationUpdateSchema.parse(body)

    // Filter out undefined values
    const updateData: Record<string, any> = {}
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updateData[key] = value
      }
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    })

    // Log audit
    await logAudit({
      organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.ORGANIZATION_UPDATED,
      resource: "organization",
      resourceId: organizationId,
      metadata: {
        changes: updateData
      }
    })

    return NextResponse.json(updatedOrganization)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating organization:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'organisation" },
      { status: 500 }
    )
  }
}
