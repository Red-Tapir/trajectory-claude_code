import { prisma } from './prisma'

interface AuditLogParams {
  organizationId: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an audit event
 *
 * @example
 * await logAudit({
 *   organizationId: org.id,
 *   userId: user.id,
 *   action: 'client.created',
 *   resource: 'client',
 *   resourceId: client.id,
 *   metadata: { name: client.name },
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent']
 * })
 */
export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Get audit logs for an organization
 */
export async function getAuditLogs(params: {
  organizationId: string
  limit?: number
  offset?: number
  userId?: string
  resource?: string
  action?: string
  startDate?: Date
  endDate?: Date
}) {
  const {
    organizationId,
    limit = 100,
    offset = 0,
    userId,
    resource,
    action,
    startDate,
    endDate
  } = params

  const where: any = {
    organizationId
  }

  if (userId) where.userId = userId
  if (resource) where.resource = resource
  if (action) where.action = action

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ])

  return {
    logs,
    total,
    limit,
    offset
  }
}

/**
 * Get audit log for a specific resource
 */
export async function getResourceAuditLog(params: {
  organizationId: string
  resource: string
  resourceId: string
  limit?: number
}) {
  const { organizationId, resource, resourceId, limit = 50 } = params

  return prisma.auditLog.findMany({
    where: {
      organizationId,
      resource,
      resourceId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
  // Organization
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_UPDATED: 'organization.updated',
  ORGANIZATION_DELETED: 'organization.deleted',
  ORGANIZATION_SWITCHED: 'organization.switched',

  // Members
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_UPDATED: 'member.roleUpdated',
  MEMBER_STATUS_CHANGED: 'member.statusChanged',

  // Clients
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_DELETED: 'client.deleted',
  CLIENT_STATUS_CHANGED: 'client.statusChanged',

  // Invoices
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_DELETED: 'invoice.deleted',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_STATUS_CHANGED: 'invoice.statusChanged',

  // Budgets
  BUDGET_CREATED: 'budget.created',
  BUDGET_UPDATED: 'budget.updated',
  BUDGET_DELETED: 'budget.deleted',

  // Settings
  SETTINGS_UPDATED: 'settings.updated',

  // Billing
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',

  // Security
  LOGIN_SUCCEEDED: 'auth.loginSucceeded',
  LOGIN_FAILED: 'auth.loginFailed',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGED: 'auth.passwordChanged',
} as const
