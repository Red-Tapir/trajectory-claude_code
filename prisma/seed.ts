import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  const roleMap = new Map<string, string>() // key: role name, value: roleId

  for (const roleData of ROLES) {
    const { permissions: rolePermissions, ...roleInfo } = roleData

    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      create: roleInfo,
      update: roleInfo,
    })

    roleMap.set(roleInfo.name, role.id)
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

  console.log('✅ RBAC seeding completed!')

  return roleMap
}

async function main() {
  console.log('🌱 Début du seeding...\n')

  // First, seed RBAC system
  const roleMap = await seedRBAC()
  const ownerRoleId = roleMap.get('owner')

  if (!ownerRoleId) {
    throw new Error('Owner role not found after RBAC seeding')
  }

  console.log('\n🌱 Seeding demo data...')

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@trajectory.fr' },
    update: {},
    create: {
      email: 'demo@trajectory.fr',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('✅ Utilisateur créé:', user.email)

  // Créer une organisation (anciennement entreprise)
  const organization = await prisma.organization.upsert({
    where: { id: 'org-demo-1' },
    update: {},
    create: {
      id: 'org-demo-1',
      name: 'Ma Super Entreprise',
      slug: 'ma-super-entreprise',
      siret: '12345678901234',
      address: '123 Rue de la Demo',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@masuperentreprise.fr',
      plan: 'pro',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Organisation créée:', organization.name)

  // Lier l'utilisateur à l'organisation avec le rôle owner
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        userId: user.id,
        organizationId: organization.id,
      }
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      roleId: ownerRoleId,
      status: 'active',
    },
  })

  // Set current organization for user
  await prisma.user.update({
    where: { id: user.id },
    data: { currentOrganizationId: organization.id },
  })

  console.log('✅ Utilisateur lié à l\'organisation avec le rôle owner')

  // Créer des clients de démonstration
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: 'SARL Dupont',
        email: 'contact@dupont.fr',
        phone: '+33 6 12 34 56 78',
        address: '10 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France',
        siret: '98765432109876',
        type: 'company',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: 'Tech Solutions',
        email: 'contact@techsolutions.fr',
        phone: '+33 6 23 45 67 89',
        address: '45 Boulevard Innovation',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France',
        siret: '11122233344455',
        type: 'company',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: 'Consulting Pro',
        email: 'contact@consultingpro.fr',
        phone: '+33 6 34 56 78 90',
        address: '78 Rue du Commerce',
        city: 'Toulouse',
        postalCode: '31000',
        country: 'France',
        type: 'company',
        status: 'prospect',
      },
    }),
  ])

  console.log(`✅ ${clients.length} clients créés`)

  // Créer des factures de démonstration
  const invoices = []
  for (let i = 0; i < 5; i++) {
    const client = clients[i % clients.length]
    const date = new Date(2024, 9 - i, 15)
    const dueDate = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: organization.id,
        clientId: client.id,
        number: `2024-${String(45 - i).padStart(3, '0')}`,
        date,
        dueDate,
        status: i === 0 ? 'sent' : i === 1 ? 'overdue' : 'paid',
        subtotal: 2000 + i * 500,
        taxRate: 20.0,
        taxAmount: (2000 + i * 500) * 0.2,
        total: (2000 + i * 500) * 1.2,
        currency: 'EUR',
        notes: 'Merci pour votre confiance',
        paymentTerms: 'Paiement à 30 jours',
        items: {
          create: [
            {
              description: 'Prestation de développement web',
              quantity: 5 + i,
              unitPrice: 400,
              taxRate: 20.0,
              total: (5 + i) * 400,
            },
          ],
        },
      },
    })
    invoices.push(invoice)
  }

  console.log(`✅ ${invoices.length} factures créées`)

  // Créer un budget de démonstration
  const budget = await prisma.budget.create({
    data: {
      organizationId: organization.id,
      name: 'Budget 2024',
      year: 2024,
      type: 'annual',
      status: 'active',
      categories: {
        create: [
          {
            name: 'Prestations de service',
            type: 'revenue',
            planned: 120000,
            actual: 98500,
          },
          {
            name: 'Ventes de produits',
            type: 'revenue',
            planned: 80000,
            actual: 72300,
          },
          {
            name: 'Salaires',
            type: 'expense',
            planned: 60000,
            actual: 58200,
          },
          {
            name: 'Marketing',
            type: 'expense',
            planned: 15000,
            actual: 12800,
          },
        ],
      },
    },
  })

  console.log('✅ Budget créé:', budget.name)

  console.log('\n🎉 Seeding terminé avec succès!')
  console.log('\n📧 Compte de test:')
  console.log('   Email: demo@trajectory.fr')
  console.log('   Mot de passe: password123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
