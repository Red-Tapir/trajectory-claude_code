import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

/**
 * GDPR Account Deletion Endpoint
 * Allows users to delete their account and anonymize their data
 * Complies with GDPR Article 17 (Right to erasure / "Right to be forgotten")
 *
 * Note: This performs a "soft delete" by anonymizing the user's data
 * rather than hard deletion to maintain data integrity and audit trails.
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's memberships to check if they're sole owner
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId: userId,
        status: 'active',
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                status: 'active',
              },
              include: {
                role: true
              }
            }
          }
        },
        role: true
      }
    })

    // Check if user is the sole owner of any organization
    const soleOwnerOrgs = memberships.filter(membership => {
      const org = membership.organization
      const isOwner = membership.role.name === 'owner'
      const ownerCount = org.members.filter(m => m.role.name === 'owner').length

      return isOwner && ownerCount === 1 && org.members.length > 1
    })

    if (soleOwnerOrgs.length > 0) {
      const orgNames = soleOwnerOrgs.map(m => m.organization.name).join(', ')
      return NextResponse.json(
        {
          error: "Impossible de supprimer le compte",
          message: `Vous êtes le seul propriétaire des organisations suivantes : ${orgNames}. Veuillez transférer la propriété ou supprimer ces organisations avant de supprimer votre compte.`,
          organizations: soleOwnerOrgs.map(m => ({
            id: m.organizationId,
            name: m.organization.name,
          }))
        },
        { status: 400 }
      )
    }

    // Get user data for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    const timestamp = Date.now()
    const anonymizedEmail = `deleted_${timestamp}@trajectory.fr`

    // Create audit log BEFORE deletion
    const currentOrgId = session.user.currentOrganizationId
    if (currentOrgId) {
      await logAudit({
        organizationId: currentOrgId,
        userId: userId,
        action: "user.account_deleted",
        resource: "user",
        resourceId: userId,
        metadata: {
          originalEmail: user.email,
          originalName: user.name,
          timestamp: new Date().toISOString(),
          reason: "User requested account deletion (GDPR)",
        }
      })
    }

    // Perform anonymization in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Anonymize user data
      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          name: "Utilisateur supprimé",
          password: null,
          image: null,
          emailVerified: null,
          currentOrganizationId: null,
        }
      })

      // 2. Delete all sessions (force logout)
      await tx.session.deleteMany({
        where: { userId: userId }
      })

      // 3. Delete all OAuth accounts
      await tx.account.deleteMany({
        where: { userId: userId }
      })

      // 4. Remove from all organizations (except sole-owner orgs)
      await tx.organizationMember.updateMany({
        where: {
          userId: userId,
          status: 'active',
        },
        data: {
          status: 'removed',
          updatedAt: new Date(),
        }
      })

      // 5. Delete pending invitations sent by this user
      await tx.organizationInvitation.deleteMany({
        where: {
          invitedBy: userId,
          status: 'pending',
        }
      })

      // 6. Delete pending invitations to this user
      await tx.organizationInvitation.deleteMany({
        where: {
          email: user.email || undefined,
          status: 'pending',
        }
      })

      // 7. Anonymize audit logs (keep for compliance but remove PII)
      await tx.auditLog.updateMany({
        where: { userId: userId },
        data: {
          metadata: { anonymized: true, deletedAt: new Date().toISOString() },
          ipAddress: null,
          userAgent: null,
        }
      })

      // Note: We do NOT delete:
      // - Clients, invoices, budgets (belong to organization, not user)
      // - Organizations where user was sole member (those can be soft-deleted separately)
      // - Audit logs (kept for compliance, but anonymized)
    })

    // Return success
    return NextResponse.json({
      success: true,
      message: "Votre compte a été supprimé avec succès. Vous allez être déconnecté.",
      deletedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Error deleting user account:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    )
  }
}

/**
 * Get account deletion eligibility
 * Checks if user can delete their account or has blockers
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's memberships
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId: userId,
        status: 'active',
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          include: {
            members: {
              where: { status: 'active' },
              include: {
                role: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        },
        role: {
          select: {
            name: true,
            displayName: true,
          }
        }
      }
    })

    // Check for blockers
    const soleOwnerOrgs = memberships.filter(membership => {
      const org = membership.organization
      const isOwner = membership.role.name === 'owner'
      const ownerCount = org.members.filter(m => m.role.name === 'owner').length

      return isOwner && ownerCount === 1 && org.members.length > 1
    })

    const canDelete = soleOwnerOrgs.length === 0

    return NextResponse.json({
      canDelete,
      memberships: memberships.map(m => ({
        organizationId: m.organizationId,
        organizationName: m.organization.name,
        role: m.role.displayName,
        isOwner: m.role.name === 'owner',
        memberCount: m.organization.members.length,
      })),
      blockers: soleOwnerOrgs.length > 0 ? [
        {
          type: "sole_owner",
          message: "Vous êtes le seul propriétaire d'une ou plusieurs organisations avec d'autres membres",
          organizations: soleOwnerOrgs.map(m => ({
            id: m.organizationId,
            name: m.organization.name,
            memberCount: m.organization.members.length,
          }))
        }
      ] : [],
    })

  } catch (error) {
    console.error("Error checking account deletion eligibility:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    )
  }
}
