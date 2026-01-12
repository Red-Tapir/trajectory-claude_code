import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GDPR Data Export Endpoint
 * Provides users with a complete export of their personal data
 * Complies with GDPR Article 15 (Right of access) and Article 20 (Right to data portability)
 */
export async function GET(req: NextRequest) {
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

    // Fetch ALL user data from database
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // User memberships and organizations
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                createdAt: true,
                updatedAt: true,
              }
            },
            role: {
              select: {
                name: true,
                displayName: true,
                description: true,
              }
            }
          }
        },
        // Accounts (OAuth providers)
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
            scope: true,
            createdAt: true,
          }
        },
        // Sessions
        sessions: {
          select: {
            sessionToken: true,
            expires: true,
            createdAt: true,
          }
        },
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Get organizations where user is member (with more details)
    const organizationIds = userData.memberships.map(m => m.organizationId)

    // Get clients created by this user or in their organizations
    const clients = await prisma.client.findMany({
      where: {
        organizationId: { in: organizationIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
      }
    })

    // Get invoices from user's organizations
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: { in: organizationIds }
      },
      select: {
        id: true,
        number: true,
        status: true,
        issueDate: true,
        dueDate: true,
        subtotal: true,
        tax: true,
        total: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        clientId: true,
      }
    })

    // Get audit logs for this user
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        organizationId: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000 // Limit to last 1000 audit logs
    })

    // Get organization invitations
    const sentInvitations = await prisma.organizationInvitation.findMany({
      where: {
        invitedBy: userId
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        organizationId: true,
      }
    })

    const receivedInvitations = await prisma.organizationInvitation.findMany({
      where: {
        email: userData.email || undefined
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        organizationId: true,
      }
    })

    // Build complete data export
    const dataExport = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0.0",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image,
        emailVerified: userData.emailVerified,
        currentOrganizationId: userData.currentOrganizationId,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      memberships: userData.memberships.map(m => ({
        organizationId: m.organizationId,
        organizationName: m.organization.name,
        organizationSlug: m.organization.slug,
        organizationPlan: m.organization.plan,
        role: m.role.displayName,
        status: m.status,
        joinedAt: m.createdAt,
      })),
      accounts: userData.accounts,
      sessions: userData.sessions.map(s => ({
        expires: s.expires,
        createdAt: s.createdAt,
      })),
      clients: clients,
      invoices: invoices,
      auditLogs: auditLogs,
      invitations: {
        sent: sentInvitations,
        received: receivedInvitations,
      },
      metadata: {
        totalMemberships: userData.memberships.length,
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalAuditLogs: auditLogs.length,
        totalInvitationsSent: sentInvitations.length,
        totalInvitationsReceived: receivedInvitations.length,
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `trajectory-data-export-${timestamp}.json`

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(dataExport, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      }
    })

  } catch (error) {
    console.error("Error exporting user data:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    )
  }
}
