import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inviteToOrganization } from "@/lib/organization"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  roleId: z.string(),
})

// GET organization members
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id

    // Check permission to view members
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "member:read"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de voir les membres" },
        { status: 403 }
      )
    }

    // Get organization members with user and role details
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            priority: true,
          },
        },
      },
      orderBy: [
        { role: { priority: "desc" } },
        { joinedAt: "asc" },
      ],
    })

    return NextResponse.json({ members })

  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    )
  }
}

// POST invite member to organization
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id

    // Check permission to invite members
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "member:create"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'inviter des membres" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, roleId } = inviteSchema.parse(body)

    // Invite the user
    const member = await inviteToOrganization({
      organizationId,
      email,
      roleId,
      invitedBy: session.user.id,
    })

    // Log audit
    await logAudit({
      organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.MEMBER_INVITED,
      resource: "member",
      resourceId: member.id,
      metadata: {
        email,
        roleId,
      },
    })

    return NextResponse.json(member, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error inviting member:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'invitation du membre" },
      { status: 500 }
    )
  }
}
