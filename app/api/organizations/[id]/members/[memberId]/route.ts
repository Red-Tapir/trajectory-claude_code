import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { removeMember, updateMemberRole } from "@/lib/organization"
import { can } from "@/lib/permissions"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { z } from "zod"

const updateSchema = z.object({
  roleId: z.string(),
})

// PATCH update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id
    const memberId = params.memberId

    // Check permission to update members
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "member:update"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier les membres" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { roleId } = updateSchema.parse(body)

    // Update member role
    const member = await updateMemberRole({
      organizationId,
      userId: memberId,
      roleId,
      updatedBy: session.user.id,
    })

    // Log audit
    await logAudit({
      organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.MEMBER_ROLE_UPDATED,
      resource: "member",
      resourceId: member.id,
      metadata: {
        oldRoleId: member.roleId,
        newRoleId: roleId,
      },
    })

    return NextResponse.json(member)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating member:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du membre" },
      { status: 500 }
    )
  }
}

// DELETE remove member from organization
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id
    const memberId = params.memberId

    // Check permission to remove members
    const hasPermission = await can(
      session.user.id,
      organizationId,
      "member:delete"
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de supprimer des membres" },
        { status: 403 }
      )
    }

    // Remove member
    await removeMember({
      organizationId,
      userId: memberId,
      removedBy: session.user.id,
    })

    // Log audit
    await logAudit({
      organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.MEMBER_REMOVED,
      resource: "member",
      resourceId: memberId,
      metadata: {
        removedUserId: memberId,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    )
  }
}
