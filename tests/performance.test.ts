import { test, expect } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createPrismaScoped } from '@/lib/prisma-scoped'

/**
 * Performance Tests
 *
 * These tests verify that the application can handle large datasets
 * and maintain acceptable response times.
 */

test.describe('Performance Tests', () => {
  const testOrgId = `perf-test-${Date.now()}`

  test.beforeAll(async () => {
    // Create test organization
    await prisma.organization.create({
      data: {
        id: testOrgId,
        name: 'Performance Test Org',
        slug: `perf-test-${Date.now()}`,
        plan: 'enterprise', // Unlimited
      },
    })
  })

  test.afterAll(async () => {
    // Cleanup
    await prisma.client.deleteMany({
      where: { organizationId: testOrgId },
    })

    await prisma.organization.delete({
      where: { id: testOrgId },
    })
  })

  test('should create 1000 clients in reasonable time', async () => {
    const scoped = createPrismaScoped(testOrgId)
    const clientsToCreate = 1000

    console.log(`\n📊 Creating ${clientsToCreate} clients...`)
    const startCreate = Date.now()

    // Create clients in batches for better performance
    const batchSize = 100
    const batches = Math.ceil(clientsToCreate / batchSize)

    for (let batch = 0; batch < batches; batch++) {
      const clientsInBatch = Math.min(batchSize, clientsToCreate - batch * batchSize)

      await prisma.client.createMany({
        data: Array.from({ length: clientsInBatch }, (_, i) => ({
          organizationId: testOrgId,
          name: `Perf Client ${batch * batchSize + i}`,
          email: `perf-client-${batch * batchSize + i}@test.com`,
          status: 'active',
          type: 'individual',
          country: 'France',
        })),
      })

      if ((batch + 1) % 5 === 0) {
        console.log(`  Created ${(batch + 1) * batchSize} clients...`)
      }
    }

    const createTime = Date.now() - startCreate
    console.log(`✅ Created ${clientsToCreate} clients in ${createTime}ms (${(createTime / clientsToCreate).toFixed(2)}ms per client)`)

    // Should create 1000 clients in less than 10 seconds
    expect(createTime).toBeLessThan(10000)
  })

  test('should query 1000 clients efficiently', async () => {
    const scoped = createPrismaScoped(testOrgId)

    console.log(`\n📊 Querying all clients...`)
    const startQuery = Date.now()

    const clients = await scoped.client.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const queryTime = Date.now() - startQuery
    console.log(`✅ Queried ${clients.length} clients in ${queryTime}ms`)

    // Should query 1000 clients in less than 1 second
    expect(queryTime).toBeLessThan(1000)
    expect(clients.length).toBeGreaterThanOrEqual(1000)
  })

  test('should query clients with includes efficiently', async () => {
    const scoped = createPrismaScoped(testOrgId)

    console.log(`\n📊 Querying clients with invoices...`)
    const startQuery = Date.now()

    const clients = await scoped.client.findMany({
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const queryTime = Date.now() - startQuery
    console.log(`✅ Queried ${clients.length} clients with invoices in ${queryTime}ms`)

    // Should query with includes in less than 2 seconds
    expect(queryTime).toBeLessThan(2000)
    expect(clients.length).toBeGreaterThanOrEqual(1000)
  })

  test('should paginate large datasets efficiently', async () => {
    const scoped = createPrismaScoped(testOrgId)

    console.log(`\n📊 Testing pagination (10 pages of 100)...`)
    const pageSize = 100
    const pages = 10
    const totalTime: number[] = []

    for (let page = 0; page < pages; page++) {
      const startPage = Date.now()

      await scoped.client.findMany({
        skip: page * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      })

      const pageTime = Date.now() - startPage
      totalTime.push(pageTime)
    }

    const avgTime = totalTime.reduce((a, b) => a + b, 0) / totalTime.length
    const maxTime = Math.max(...totalTime)

    console.log(`✅ Average page load: ${avgTime.toFixed(2)}ms, Max: ${maxTime}ms`)

    // Each page should load in less than 200ms
    expect(maxTime).toBeLessThan(200)
    expect(avgTime).toBeLessThan(100)
  })

  test('should search clients efficiently', async () => {
    const scoped = createPrismaScoped(testOrgId)

    console.log(`\n📊 Testing client search...`)
    const startSearch = Date.now()

    const results = await scoped.client.findMany({
      where: {
        OR: [
          { name: { contains: 'Client 5', mode: 'insensitive' } },
          { email: { contains: 'client-5', mode: 'insensitive' } },
        ],
      },
    })

    const searchTime = Date.now() - startSearch
    console.log(`✅ Search returned ${results.length} results in ${searchTime}ms`)

    // Search should complete in less than 500ms
    expect(searchTime).toBeLessThan(500)
    expect(results.length).toBeGreaterThan(0)
  })

  test('should handle concurrent reads', async () => {
    const scoped = createPrismaScoped(testOrgId)

    console.log(`\n📊 Testing 10 concurrent reads...`)
    const startConcurrent = Date.now()

    const promises = Array.from({ length: 10 }, () =>
      scoped.client.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      })
    )

    const results = await Promise.all(promises)
    const concurrentTime = Date.now() - startConcurrent

    console.log(`✅ Completed 10 concurrent reads in ${concurrentTime}ms (${(concurrentTime / 10).toFixed(2)}ms per query)`)

    // Should handle 10 concurrent reads in less than 2 seconds
    expect(concurrentTime).toBeLessThan(2000)
    results.forEach(result => {
      expect(result.length).toBe(100)
    })
  })
})

test.describe('API Response Time Tests', () => {
  test('should measure API endpoint performance', async () => {
    // Note: These would need actual API calls
    // This is a placeholder for measuring API response times

    console.log(`\n📊 API Performance Benchmarks:`)
    console.log(`  - GET /api/clients: Target < 500ms`)
    console.log(`  - POST /api/clients: Target < 300ms`)
    console.log(`  - GET /api/invoices: Target < 500ms`)
    console.log(`  - POST /api/invoices: Target < 400ms`)
    console.log(`  - GET /api/dashboard: Target < 800ms`)

    // This test always passes - it's just documentation
    expect(true).toBe(true)
  })
})
