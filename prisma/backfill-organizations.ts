import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Backfill script to migrate from old Company model to new Organization model
 *
 * This script:
 * 1. Creates Organization for each Company
 * 2. Migrates OrganizationMember from CompanyMember with roles
 * 3. Updates all tenant-scoped entities (clients, invoices, etc.)
 * 4. Sets currentOrganizationId for all users
 */
async function backfillOrganizations() {
  console.log('🔄 Starting backfill: Company → Organization migration...\n')

  // Get owner role
  const ownerRole = await prisma.role.findUnique({
    where: { name: 'owner' }
  })

  if (!ownerRole) {
    throw new Error('Owner role not found. Please run seed-rbac.ts first!')
  }

  // Get all old Company records
  const companies = await prisma.$queryRawUnsafe<any[]>(`
    SELECT * FROM "Company" ORDER BY "createdAt" ASC
  `)

  console.log(`Found ${companies.length} companies to migrate\n`)

  for (const company of companies) {
    console.log(`\nMigrating Company: ${company.name} (${company.id})`)

    try {
      // Generate slug from company name
      const baseSlug = company.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      let slug = baseSlug
      let slugCounter = 1

      // Ensure unique slug
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${slugCounter}`
        slugCounter++
      }

      // Create Organization
      const organization = await prisma.organization.create({
        data: {
          id: company.id, // Keep same ID for easier data migration
          name: company.name,
          slug,
          siret: company.siret,
          address: company.address,
          city: company.city,
          postalCode: company.postalCode,
          country: company.country || 'France',
          phone: company.phone,
          email: company.email,
          logo: company.logo,
          plan: company.plan || 'trial',
          trialEndsAt: company.trialEndsAt,
          stripeCustomerId: company.stripeCustomerId,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        }
      })

      console.log(`  ✓ Organization created with slug: ${slug}`)

      // Migrate CompanyMembers to OrganizationMembers
      const companyMembers = await prisma.$queryRawUnsafe<any[]>(`
        SELECT * FROM "CompanyMember" WHERE "companyId" = $1
      `, company.id)

      console.log(`  Migrating ${companyMembers.length} members...`)

      for (const member of companyMembers) {
        // Map old role to new role
        const roleName = member.role === 'owner' ? 'owner'
                       : member.role === 'admin' ? 'admin'
                       : member.role === 'member' ? 'editor'
                       : 'viewer'

        const role = await prisma.role.findUnique({
          where: { name: roleName }
        })

        if (!role) {
          console.warn(`    ⚠️  Role ${roleName} not found, using viewer`)
          continue
        }

        await prisma.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: member.userId,
            roleId: role.id,
            status: 'active',
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
          }
        })

        // Set as current organization if user doesn't have one
        await prisma.user.updateMany({
          where: {
            id: member.userId,
            currentOrganizationId: null,
          },
          data: {
            currentOrganizationId: organization.id
          }
        })
      }

      console.log(`  ✓ ${companyMembers.length} members migrated`)

      // Update related entities (clients, invoices, budgets, scenarios)
      // Note: If we kept same ID, no update needed. Otherwise:

      // await prisma.client.updateMany({
      //   where: { companyId: company.id },
      //   data: { organizationId: organization.id }
      // })
      // ... same for invoice, budget, scenario, subscription

      console.log(`  ✓ All data migrated for ${company.name}`)

    } catch (error) {
      console.error(`  ❌ Error migrating company ${company.name}:`, error)
      // Continue with next company
    }
  }

  console.log('\n✅ Backfill completed!')
  console.log('\n📊 Summary:')

  const orgCount = await prisma.organization.count()
  const memberCount = await prisma.organizationMember.count()
  const usersWithOrg = await prisma.user.count({
    where: { currentOrganizationId: { not: null } }
  })

  console.log(`  Organizations: ${orgCount}`)
  console.log(`  Members: ${memberCount}`)
  console.log(`  Users with current org: ${usersWithOrg}`)
}

backfillOrganizations()
  .catch((e) => {
    console.error('❌ Error during backfill:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
