import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define all permissions
const PERMISSIONS = [
  // Organization
  { resource: 'organization', action: 'read', description: 'View organization details' },
  { resource: 'organization', action: 'update', description: 'Update organization settings' },
  { resource: 'organization', action: 'delete', description: 'Delete organization' },
  { resource: 'organization', action: 'manage', description: 'Full organization management' },

  // Members
  { resource: 'member', action: 'read', description: 'View team members' },
  { resource: 'member', action: 'invite', description: 'Invite new members' },
  { resource: 'member', action: 'update', description: 'Update member roles' },
  { resource: 'member', action: 'remove', description: 'Remove members' },
  { resource: 'member', action: 'manage', description: 'Full member management' },

  // Clients
  { resource: 'client', action: 'read', description: 'View clients' },
  { resource: 'client', action: 'create', description: 'Create new clients' },
  { resource: 'client', action: 'update', description: 'Update clients' },
  { resource: 'client', action: 'delete', description: 'Delete clients' },
  { resource: 'client', action: 'export', description: 'Export client data' },

  // Invoices
  { resource: 'invoice', action: 'read', description: 'View invoices' },
  { resource: 'invoice', action: 'create', description: 'Create new invoices' },
  { resource: 'invoice', action: 'update', description: 'Update invoices' },
  { resource: 'invoice', action: 'delete', description: 'Delete invoices' },
  { resource: 'invoice', action: 'send', description: 'Send invoices to clients' },
  { resource: 'invoice', action: 'export', description: 'Export invoice data' },

  // Budgets
  { resource: 'budget', action: 'read', description: 'View budgets' },
  { resource: 'budget', action: 'create', description: 'Create new budgets' },
  { resource: 'budget', action: 'update', description: 'Update budgets' },
  { resource: 'budget', action: 'delete', description: 'Delete budgets' },

  // Reports
  { resource: 'report', action: 'read', description: 'View reports' },
  { resource: 'report', action: 'export', description: 'Export reports' },

  // Billing
  { resource: 'billing', action: 'read', description: 'View billing information' },
  { resource: 'billing', action: 'manage', description: 'Manage subscription and billing' },
]

// Define roles with their permissions
const ROLES = [
  {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full access to everything. Can transfer ownership.',
    isSystem: true,
    priority: 100,
    permissions: ['*'] // All permissions
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full access except ownership transfer and organization deletion.',
    isSystem: true,
    priority: 90,
    permissions: [
      'organization:read',
      'organization:update',
      'member:*',
      'client:*',
      'invoice:*',
      'budget:*',
      'report:*',
      'billing:read',
    ]
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Can manage clients, invoices, and budgets. Can view reports.',
    isSystem: true,
    priority: 70,
    permissions: [
      'organization:read',
      'member:read',
      'client:*',
      'invoice:*',
      'budget:*',
      'report:*',
    ]
  },
  {
    name: 'editor',
    displayName: 'Editor',
    description: 'Can create and edit clients and invoices. Cannot delete.',
    isSystem: true,
    priority: 50,
    permissions: [
      'organization:read',
      'member:read',
      'client:read',
      'client:create',
      'client:update',
      'invoice:read',
      'invoice:create',
      'invoice:update',
      'invoice:send',
      'budget:read',
      'report:read',
    ]
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to all resources.',
    isSystem: true,
    priority: 10,
    permissions: [
      'organization:read',
      'member:read',
      'client:read',
      'invoice:read',
      'budget:read',
      'report:read',
      'billing:read',
    ]
  },
]

async function seedRBAC() {
  console.log('🌱 Seeding RBAC (Roles & Permissions)...')

  // Create all permissions
  console.log('Creating permissions...')
  const permissionMap = new Map<string, string>() // key: resource:action, value: permissionId

  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        }
      },
      create: perm,
      update: perm,
    })
    permissionMap.set(`${perm.resource}:${perm.action}`, permission.id)
    console.log(`  ✓ ${perm.resource}:${perm.action}`)
  }

  // Create roles with permissions
  console.log('\nCreating roles...')
  for (const roleData of ROLES) {
    const { permissions: rolePermissions, ...roleInfo } = roleData

    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      create: roleInfo,
      update: roleInfo,
    })

    console.log(`  ✓ ${roleInfo.displayName} (${roleInfo.name})`)

    // Assign permissions to role
    const permissionsToAssign: string[] = []

    if (rolePermissions.includes('*')) {
      // Grant all permissions
      permissionsToAssign.push(...permissionMap.values())
    } else {
      for (const permPattern of rolePermissions) {
        if (permPattern.endsWith(':*')) {
          // Wildcard: grant all actions for this resource
          const resource = permPattern.slice(0, -2)
          for (const [key, id] of permissionMap) {
            if (key.startsWith(resource + ':')) {
              permissionsToAssign.push(id)
            }
          }
        } else {
          // Exact match
          const permId = permissionMap.get(permPattern)
          if (permId) {
            permissionsToAssign.push(permId)
          }
        }
      }
    }

    // Delete existing role permissions and recreate
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    })

    for (const permissionId of permissionsToAssign) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId,
        }
      })
    }

    console.log(`    Assigned ${permissionsToAssign.length} permissions`)
  }

  console.log('\n✅ RBAC seeding completed!')
}

seedRBAC()
  .catch((e) => {
    console.error('❌ Error seeding RBAC:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
