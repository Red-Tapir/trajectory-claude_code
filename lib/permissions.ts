import { prisma } from './prisma'

/**
 * Permission cache to avoid repeated DB queries
 */
const permissionCache = new Map<string, Set<string>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  permissions: Set<string>
  timestamp: number
}

const rolePermissionsCache = new Map<string, CacheEntry>()

/**
 * Get all permissions for a role (with caching)
 */
async function getRolePermissions(roleId: string): Promise<Set<string>> {
  const cached = rolePermissionsCache.get(roleId)
  const now = Date.now()

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.permissions
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: {
      permission: true
    }
  })

  const permissions = new Set(
    rolePermissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
  )

  rolePermissionsCache.set(roleId, {
    permissions,
    timestamp: now
  })

  return permissions
}

/**
 * Check if a user has a specific permission in an organization
 *
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param permission - Permission string in format "resource:action" (e.g., "client:create")
 * @returns true if user has permission, false otherwise
 *
 * @example
 * const canCreate = await can(userId, orgId, 'client:create')
 * if (!canCreate) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
 * }
 */
export async function can(
  userId: string,
  organizationId: string,
  permission: string
): Promise<boolean> {
  try {
    // Get user's membership in this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId
        }
      },
      include: {
        role: true
      }
    })

    if (!membership || membership.status !== 'active') {
      return false
    }

    // Get all permissions for this role
    const rolePermissions = await getRolePermissions(membership.roleId)

    // Check for exact permission match
    if (rolePermissions.has(permission)) {
      return true
    }

    // Check for wildcard permissions
    const [resource, action] = permission.split(':')

    // Check resource:* (e.g., "client:*" grants all client actions)
    if (rolePermissions.has(`${resource}:*`)) {
      return true
    }

    // Check *:* (full admin - owner role)
    if (rolePermissions.has('*:*') || rolePermissions.has('*')) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Check multiple permissions at once (AND logic)
 *
 * @example
 * const hasAll = await canAll(userId, orgId, ['client:read', 'client:update'])
 */
export async function canAll(
  userId: string,
  organizationId: string,
  permissions: string[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(perm => can(userId, organizationId, perm))
  )
  return results.every(result => result)
}

/**
 * Check multiple permissions at once (OR logic)
 *
 * @example
 * const hasAny = await canAny(userId, orgId, ['client:update', 'client:delete'])
 */
export async function canAny(
  userId: string,
  organizationId: string,
  permissions: string[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(perm => can(userId, organizationId, perm))
  )
  return results.some(result => result)
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<{ name: string; displayName: string; priority: number } | null> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId
      }
    },
    include: {
      role: true
    }
  })

  if (!membership) {
    return null
  }

  return {
    name: membership.role.name,
    displayName: membership.role.displayName,
    priority: membership.role.priority
  }
}

/**
 * Check if user is owner of organization
 */
export async function isOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId)
  return role?.name === 'owner'
}

/**
 * Check if user is admin or owner of organization
 */
export async function isAdminOrOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId)
  return role?.name === 'owner' || role?.name === 'admin'
}

/**
 * Require permission middleware helper
 * Throws error if permission is denied
 */
export async function requirePermission(
  userId: string,
  organizationId: string,
  permission: string
): Promise<void> {
  const hasPermission = await can(userId, organizationId, permission)
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

/**
 * Clear permission cache for a role (call after role permissions change)
 */
export function clearPermissionCache(roleId?: string) {
  if (roleId) {
    rolePermissionsCache.delete(roleId)
  } else {
    rolePermissionsCache.clear()
  }
}

/**
 * Alias for can() - used in API routes
 * @param userId - User ID
 * @param organizationId - Organization ID  
 * @param resource - Resource name (e.g., "client", "invoice", "quote")
 * @param action - Action name (e.g., "create", "read", "update", "delete")
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  resource: string,
  action: string
): Promise<boolean> {
  return can(userId, organizationId, `${resource}:${action}`)
}
