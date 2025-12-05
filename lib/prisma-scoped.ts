import { PrismaClient, Prisma } from '@prisma/client'
import { prisma as globalPrisma } from './prisma'

/**
 * Create a Prisma client scoped to a specific organization
 *
 * This automatically adds organizationId filter to all queries for tenant-scoped models.
 * Prevents accidental cross-tenant data leaks.
 *
 * @param organizationId - Organization ID to scope queries to
 * @returns Scoped Prisma client
 *
 * @example
 * const scoped = createPrismaScoped(session.user.currentOrganizationId)
 * const clients = await scoped.client.findMany() // Automatically filtered by org
 */
export function createPrismaScoped(organizationId: string) {
  return globalPrisma.$extends({
    query: {
      // Client model
      client: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, organizationId }
          return query(args)
        },
        async createMany({ args, query }) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map(d => ({ ...d, organizationId }))
          } else {
            args.data = { ...args.data, organizationId }
          }
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
      },

      // Invoice model
      invoice: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, organizationId }
          return query(args)
        },
        async createMany({ args, query }) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map(d => ({ ...d, organizationId }))
          } else {
            args.data = { ...args.data, organizationId }
          }
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
      },

      // Budget model
      budget: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, organizationId }
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
      },

      // Scenario model
      scenario: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, organizationId }
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, organizationId }
          return query(args)
        },
      },
    },
  }) as PrismaClient
}

/**
 * Verify that a record belongs to the specified organization
 *
 * @param model - Prisma model name
 * @param recordId - Record ID
 * @param organizationId - Expected organization ID
 * @throws Error if record doesn't belong to organization
 */
export async function verifyOrganizationAccess(
  model: 'client' | 'invoice' | 'budget' | 'scenario',
  recordId: string,
  organizationId: string
): Promise<void> {
  const record = await (globalPrisma[model] as any).findUnique({
    where: { id: recordId },
    select: { organizationId: true }
  })

  if (!record) {
    throw new Error(`${model} not found`)
  }

  if (record.organizationId !== organizationId) {
    throw new Error(`Access denied: ${model} belongs to different organization`)
  }
}
