import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * Get invitation details by token
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Find invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          }
        },
        role: {
          select: {
            id: true,
            displayName: true,
            description: true,
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide" },
        { status: 404 }
      )
    }

    // Check if expired
    const isExpired = new Date() > invitation.expiresAt

    if (isExpired && invitation.status === 'pending') {
      // Mark as expired
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      })
    }

    // Return invitation details (without sensitive info)
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: isExpired ? 'expired' : invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        organization: invitation.organization,
        role: invitation.role,
      }
    })

  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'invitation" },
      { status: 500 }
    )
  }
}
