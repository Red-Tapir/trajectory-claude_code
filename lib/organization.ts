import { prisma } from './prisma'
import { logAudit } from './audit'

/**
 * Create a new organization with the creator as owner
 */
export async function createOrganization(params: {
  name: string
  userId: string
  plan?: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}) {
  const { name, userId, plan = 'trial', metadata } = params

  // Generate slug from name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let slug = baseSlug
  let counter = 1

  // Ensure unique slug
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Get owner role
  const ownerRole = await prisma.role.findUnique({
    where: { name: 'owner' }
  })

  if (!ownerRole) {
    throw new Error('Owner role not found')
  }

  // Set trial end date (14 days from now)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  // Create organization with owner membership in transaction
  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name,
        slug,
        plan,
        trialEndsAt,
      }
    })

    // Create owner membership
    await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId,
        roleId: ownerRole.id,
        status: 'active',
      }
    })

    // Set as user's current organization
    await tx.user.update({
      where: { id: userId },
      data: { currentOrganizationId: org.id }
    })

    return org
  })

  // Log audit
  await logAudit({
    organizationId: organization.id,
    userId,
    action: 'organization.created',
    resource: 'organization',
    resourceId: organization.id,
    metadata: {
      name: organization.name,
      slug: organization.slug,
      ...metadata
    }
  })

  return organization
}

/**
 * Get user's organizations with their roles
 */
export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,
      status: 'active'
    },
    include: {
      organization: true,
      role: {
        select: {
          name: true,
          displayName: true,
          priority: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return memberships.map(m => ({
    organization: m.organization,
    role: m.role,
    joinedAt: m.joinedAt,
    isCurrent: m.organization.id === memberships[0]?.organization.id
  }))
}

/**
 * Switch user's current organization
 */
export async function switchOrganization(params: {
  userId: string
  organizationId: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}) {
  const { userId, organizationId, metadata } = params

  // Verify user is member of this organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId
      }
    }
  })

  if (!membership || membership.status !== 'active') {
    throw new Error('User is not a member of this organization')
  }

  // Update user's current organization
  await prisma.user.update({
    where: { id: userId },
    data: { currentOrganizationId: organizationId }
  })

  // Log audit
  await logAudit({
    organizationId,
    userId,
    action: 'organization.switched',
    resource: 'user',
    resourceId: userId,
    metadata
  })

  return { success: true }
}

/**
 * Invite user to organization
 */
export async function inviteToOrganization(params: {
  organizationId: string
  email: string
  roleId: string
  invitedBy: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}) {
  const { organizationId, email, roleId, invitedBy, metadata } = params

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email }
  })

  // If user doesn't exist, they'll need to sign up first
  // For now, we'll just create a pending membership

  if (!user) {
    // TODO: Send invitation email
    throw new Error('User must sign up first before being invited')
  }

  // Check if already a member
  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id
      }
    }
  })

  if (existingMembership) {
    throw new Error('User is already a member of this organization')
  }

  // Create membership
  const membership = await prisma.organizationMember.create({
    data: {
      organizationId,
      userId: user.id,
      roleId,
      invitedBy,
      status: 'active',
    }
  })

  // Log audit
  await logAudit({
    organizationId,
    userId: invitedBy,
    action: 'member.invited',
    resource: 'organizationMember',
    resourceId: membership.id,
    metadata: {
      invitedUserId: user.id,
      invitedEmail: email,
      ...metadata
    }
  })

  return membership
}

/**
 * Remove member from organization
 */
export async function removeMember(params: {
  organizationId: string
  userId: string
  removedBy: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}) {
  const { organizationId, userId, removedBy, metadata } = params

  // Cannot remove yourself if you're the only owner
  const ownerRole = await prisma.role.findUnique({
    where: { name: 'owner' }
  })

  if (ownerRole) {
    const ownerCount = await prisma.organizationMember.count({
      where: {
        organizationId,
        roleId: ownerRole.id,
        status: 'active'
      }
    })

    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId
        }
      }
    })

    if (ownerCount === 1 && member?.roleId === ownerRole.id) {
      throw new Error('Cannot remove the only owner. Transfer ownership first.')
    }
  }

  // Remove membership
  await prisma.organizationMember.delete({
    where: {
      organizationId_userId: {
        organizationId,
        userId
      }
    }
  })

  // If this was user's current organization, switch to another one
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentOrganizationId: true }
  })

  if (user?.currentOrganizationId === organizationId) {
    const otherMembership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        status: 'active',
        organizationId: { not: organizationId }
      }
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentOrganizationId: otherMembership?.organizationId || null
      }
    })
  }

  // Log audit
  await logAudit({
    organizationId,
    userId: removedBy,
    action: 'member.removed',
    resource: 'organizationMember',
    metadata: {
      removedUserId: userId,
      ...metadata
    }
  })

  return { success: true }
}

/**
 * Update member role
 */
export async function updateMemberRole(params: {
  organizationId: string
  userId: string
  roleId: string
  updatedBy: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}) {
  const { organizationId, userId, roleId, updatedBy, metadata } = params

  // Cannot change role if you're the only owner
  const ownerRole = await prisma.role.findUnique({
    where: { name: 'owner' }
  })

  if (ownerRole) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId
        }
      }
    })

    if (member?.roleId === ownerRole.id) {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId,
          roleId: ownerRole.id,
          status: 'active'
        }
      })

      if (ownerCount === 1 && roleId !== ownerRole.id) {
        throw new Error('Cannot change role of the only owner')
      }
    }
  }

  // Update role
  const membership = await prisma.organizationMember.update({
    where: {
      organizationId_userId: {
        organizationId,
        userId
      }
    },
    data: { roleId }
  })

  // Log audit
  await logAudit({
    organizationId,
    userId: updatedBy,
    action: 'member.roleUpdated',
    resource: 'organizationMember',
    resourceId: membership.id,
    metadata: {
      targetUserId: userId,
      newRoleId: roleId,
      ...metadata
    }
  })

  return membership
}
