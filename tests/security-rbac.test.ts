import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { can, isOwner, isAdminOrOwner } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

/**
 * RBAC Security Tests
 *
 * These tests verify that the Role-Based Access Control system
 * properly restricts access based on user roles.
 */

describe('RBAC Security Tests', () => {
  let testOrgId: string
  let ownerUserId: string
  let adminUserId: string
  let managerUserId: string
  let editorUserId: string
  let viewerUserId: string
  let otherOrgId: string
  let otherOrgUserId: string

  beforeAll(async () => {
    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Security Org',
        slug: `test-security-${Date.now()}`,
        plan: 'trial',
      },
    })
    testOrgId = org.id

    // Create another organization for cross-org tests
    const otherOrg = await prisma.organization.create({
      data: {
        name: 'Other Org',
        slug: `other-org-${Date.now()}`,
        plan: 'trial',
      },
    })
    otherOrgId = otherOrg.id

    // Get roles
    const roles = await prisma.role.findMany({
      where: {
        name: {
          in: ['owner', 'admin', 'manager', 'editor', 'viewer'],
        },
      },
    })

    const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]))

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('testpassword', 10)

    const ownerUser = await prisma.user.create({
      data: {
        email: `owner-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Owner User',
        currentOrganizationId: testOrgId,
      },
    })
    ownerUserId = ownerUser.id

    const adminUser = await prisma.user.create({
      data: {
        email: `admin-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Admin User',
        currentOrganizationId: testOrgId,
      },
    })
    adminUserId = adminUser.id

    const managerUser = await prisma.user.create({
      data: {
        email: `manager-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Manager User',
        currentOrganizationId: testOrgId,
      },
    })
    managerUserId = managerUser.id

    const editorUser = await prisma.user.create({
      data: {
        email: `editor-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Editor User',
        currentOrganizationId: testOrgId,
      },
    })
    editorUserId = editorUser.id

    const viewerUser = await prisma.user.create({
      data: {
        email: `viewer-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Viewer User',
        currentOrganizationId: testOrgId,
      },
    })
    viewerUserId = viewerUser.id

    const otherOrgUser = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Other Org User',
        currentOrganizationId: otherOrgId,
      },
    })
    otherOrgUserId = otherOrgUser.id

    // Create memberships
    await prisma.organizationMember.createMany({
      data: [
        {
          organizationId: testOrgId,
          userId: ownerUserId,
          roleId: roleMap.owner,
          status: 'active',
        },
        {
          organizationId: testOrgId,
          userId: adminUserId,
          roleId: roleMap.admin,
          status: 'active',
        },
        {
          organizationId: testOrgId,
          userId: managerUserId,
          roleId: roleMap.manager,
          status: 'active',
        },
        {
          organizationId: testOrgId,
          userId: editorUserId,
          roleId: roleMap.editor,
          status: 'active',
        },
        {
          organizationId: testOrgId,
          userId: viewerUserId,
          roleId: roleMap.viewer,
          status: 'active',
        },
        {
          organizationId: otherOrgId,
          userId: otherOrgUserId,
          roleId: roleMap.owner,
          status: 'active',
        },
      ],
    })
  })

  afterAll(async () => {
    // Cleanup
    await prisma.organizationMember.deleteMany({
      where: {
        organizationId: {
          in: [testOrgId, otherOrgId],
        },
      },
    })

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [
            ownerUserId,
            adminUserId,
            managerUserId,
            editorUserId,
            viewerUserId,
            otherOrgUserId,
          ],
        },
      },
    })

    await prisma.organization.deleteMany({
      where: {
        id: {
          in: [testOrgId, otherOrgId],
        },
      },
    })
  })

  describe('Client Permissions', () => {
    test('Owner can create clients', async () => {
      const result = await can(ownerUserId, testOrgId, 'client:create')
      expect(result).toBe(true)
    })

    test('Admin can create clients', async () => {
      const result = await can(adminUserId, testOrgId, 'client:create')
      expect(result).toBe(true)
    })

    test('Manager can create clients', async () => {
      const result = await can(managerUserId, testOrgId, 'client:create')
      expect(result).toBe(true)
    })

    test('Editor can create clients', async () => {
      const result = await can(editorUserId, testOrgId, 'client:create')
      expect(result).toBe(true)
    })

    test('Viewer CANNOT create clients', async () => {
      const result = await can(viewerUserId, testOrgId, 'client:create')
      expect(result).toBe(false)
    })

    test('Viewer CAN read clients', async () => {
      const result = await can(viewerUserId, testOrgId, 'client:read')
      expect(result).toBe(true)
    })

    test('Editor CANNOT delete clients', async () => {
      const result = await can(editorUserId, testOrgId, 'client:delete')
      expect(result).toBe(false)
    })

    test('Manager CAN delete clients', async () => {
      const result = await can(managerUserId, testOrgId, 'client:delete')
      expect(result).toBe(true)
    })
  })

  describe('Invoice Permissions', () => {
    test('Owner can create invoices', async () => {
      const result = await can(ownerUserId, testOrgId, 'invoice:create')
      expect(result).toBe(true)
    })

    test('Viewer CANNOT create invoices', async () => {
      const result = await can(viewerUserId, testOrgId, 'invoice:create')
      expect(result).toBe(false)
    })

    test('Editor can update invoices', async () => {
      const result = await can(editorUserId, testOrgId, 'invoice:update')
      expect(result).toBe(true)
    })

    test('Editor CANNOT delete invoices', async () => {
      const result = await can(editorUserId, testOrgId, 'invoice:delete')
      expect(result).toBe(false)
    })

    test('Manager CAN delete invoices', async () => {
      const result = await can(managerUserId, testOrgId, 'invoice:delete')
      expect(result).toBe(true)
    })

    test('All roles can read invoices', async () => {
      const results = await Promise.all([
        can(ownerUserId, testOrgId, 'invoice:read'),
        can(adminUserId, testOrgId, 'invoice:read'),
        can(managerUserId, testOrgId, 'invoice:read'),
        can(editorUserId, testOrgId, 'invoice:read'),
        can(viewerUserId, testOrgId, 'invoice:read'),
      ])

      expect(results).toEqual([true, true, true, true, true])
    })
  })

  describe('Member Management Permissions', () => {
    test('Owner can invite members', async () => {
      const result = await can(ownerUserId, testOrgId, 'member:create')
      expect(result).toBe(true)
    })

    test('Admin can invite members', async () => {
      const result = await can(adminUserId, testOrgId, 'member:create')
      expect(result).toBe(true)
    })

    test('Manager CANNOT invite members', async () => {
      const result = await can(managerUserId, testOrgId, 'member:create')
      expect(result).toBe(false)
    })

    test('Editor CANNOT remove members', async () => {
      const result = await can(editorUserId, testOrgId, 'member:delete')
      expect(result).toBe(false)
    })

    test('Admin CAN remove members', async () => {
      const result = await can(adminUserId, testOrgId, 'member:delete')
      expect(result).toBe(true)
    })
  })

  describe('Organization Management Permissions', () => {
    test('Owner can update organization', async () => {
      const result = await can(ownerUserId, testOrgId, 'organization:update')
      expect(result).toBe(true)
    })

    test('Admin can update organization', async () => {
      const result = await can(adminUserId, testOrgId, 'organization:update')
      expect(result).toBe(true)
    })

    test('Manager CANNOT update organization', async () => {
      const result = await can(managerUserId, testOrgId, 'organization:update')
      expect(result).toBe(false)
    })

    test('Only owner can delete organization', async () => {
      const results = await Promise.all([
        can(ownerUserId, testOrgId, 'organization:delete'),
        can(adminUserId, testOrgId, 'organization:delete'),
        can(managerUserId, testOrgId, 'organization:delete'),
      ])

      expect(results).toEqual([true, false, false])
    })
  })

  describe('Billing Permissions', () => {
    test('Owner can manage billing', async () => {
      const result = await can(ownerUserId, testOrgId, 'billing:manage')
      expect(result).toBe(true)
    })

    test('Admin CANNOT manage billing', async () => {
      const result = await can(adminUserId, testOrgId, 'billing:manage')
      expect(result).toBe(false)
    })

    test('All roles can read billing info', async () => {
      const results = await Promise.all([
        can(ownerUserId, testOrgId, 'billing:read'),
        can(adminUserId, testOrgId, 'billing:read'),
        can(viewerUserId, testOrgId, 'billing:read'),
      ])

      expect(results).toEqual([true, true, true])
    })
  })

  describe('Cross-Organization Access', () => {
    test('User from other org CANNOT access testOrg clients', async () => {
      const result = await can(otherOrgUserId, testOrgId, 'client:read')
      expect(result).toBe(false)
    })

    test('User from other org CANNOT access testOrg invoices', async () => {
      const result = await can(otherOrgUserId, testOrgId, 'invoice:read')
      expect(result).toBe(false)
    })

    test('User from other org CANNOT manage testOrg members', async () => {
      const result = await can(otherOrgUserId, testOrgId, 'member:create')
      expect(result).toBe(false)
    })
  })

  describe('Role Helpers', () => {
    test('isOwner returns true for owner', async () => {
      const result = await isOwner(ownerUserId, testOrgId)
      expect(result).toBe(true)
    })

    test('isOwner returns false for admin', async () => {
      const result = await isOwner(adminUserId, testOrgId)
      expect(result).toBe(false)
    })

    test('isAdminOrOwner returns true for owner', async () => {
      const result = await isAdminOrOwner(ownerUserId, testOrgId)
      expect(result).toBe(true)
    })

    test('isAdminOrOwner returns true for admin', async () => {
      const result = await isAdminOrOwner(adminUserId, testOrgId)
      expect(result).toBe(true)
    })

    test('isAdminOrOwner returns false for manager', async () => {
      const result = await isAdminOrOwner(managerUserId, testOrgId)
      expect(result).toBe(false)
    })
  })

  describe('Wildcard Permissions', () => {
    test('Owner has wildcard access (*:*)', async () => {
      const results = await Promise.all([
        can(ownerUserId, testOrgId, 'client:create'),
        can(ownerUserId, testOrgId, 'invoice:delete'),
        can(ownerUserId, testOrgId, 'organization:delete'),
        can(ownerUserId, testOrgId, 'member:delete'),
      ])

      expect(results).toEqual([true, true, true, true])
    })

    test('Admin has resource wildcards (client:*, invoice:*)', async () => {
      const results = await Promise.all([
        can(adminUserId, testOrgId, 'client:create'),
        can(adminUserId, testOrgId, 'client:update'),
        can(adminUserId, testOrgId, 'client:delete'),
        can(adminUserId, testOrgId, 'invoice:create'),
        can(adminUserId, testOrgId, 'invoice:update'),
        can(adminUserId, testOrgId, 'invoice:delete'),
      ])

      expect(results).toEqual([true, true, true, true, true, true])
    })
  })

  describe('Inactive Member Access', () => {
    test('Suspended member cannot access resources', async () => {
      // Suspend the editor
      await prisma.organizationMember.updateMany({
        where: {
          organizationId: testOrgId,
          userId: editorUserId,
        },
        data: {
          status: 'suspended',
        },
      })

      const result = await can(editorUserId, testOrgId, 'client:read')
      expect(result).toBe(false)

      // Restore status for cleanup
      await prisma.organizationMember.updateMany({
        where: {
          organizationId: testOrgId,
          userId: editorUserId,
        },
        data: {
          status: 'active',
        },
      })
    })
  })
})
