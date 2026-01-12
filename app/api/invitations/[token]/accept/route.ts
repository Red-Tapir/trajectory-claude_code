import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"

export const dynamic = 'force-dynamic'

/**
 * Accept organization invitation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accepter une invitation" },
        { status: 401 }
      )
    }

    const { token } = params

    // Find invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
        role: true,
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide ou expirée" },
        { status: 404 }
      )
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Cette invitation a déjà été ${invitation.status === 'accepted' ? 'acceptée' : 'annulée'}` },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      })

      return NextResponse.json(
        { error: "Cette invitation a expiré" },
        { status: 400 }
      )
    }

    // Check if email matches (user can only accept invitation sent to their email)
    if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        {
          error: "Cette invitation a été envoyée à une autre adresse email",
          invitedEmail: invitation.email,
          currentEmail: session.user.email
        },
        { status: 403 }
      )
    }

    // Check if already a member
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: session.user.id
        }
      }
    })

    if (existingMembership) {
      // Mark invitation as accepted even though they're already a member
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' }
      })

      return NextResponse.json(
        {
          message: "Vous êtes déjà membre de cette organisation",
          organization: invitation.organization
        },
        { status: 200 }
      )
    }

    // Create membership
    const membership = await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
        roleId: invitation.roleId,
        invitedBy: invitation.invitedBy,
        status: 'active',
      }
    })

    // Update invitation status
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        updatedAt: new Date()
      }
    })

    // Update user's current organization if they don't have one
    if (!session.user.currentOrganizationId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { currentOrganizationId: invitation.organizationId }
      })
    }

    // Log audit
    await logAudit({
      organizationId: invitation.organizationId,
      userId: session.user.id,
      action: AUDIT_ACTIONS.MEMBER_JOINED,
      resource: "organizationMember",
      resourceId: membership.id,
      metadata: {
        invitationId: invitation.id,
        roleId: invitation.roleId,
        invitedBy: invitation.invitedBy,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Bienvenue dans ${invitation.organization.name} !`,
      organization: invitation.organization,
      membership
    }, { status: 200 })

  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de l'invitation" },
      { status: 500 }
    )
  }
}
