import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Test 1: Database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Database connection OK:", dbTest)

    // Test 2: Check existing users
    const userCount = await prisma.user.count()
    console.log("✅ User count:", userCount)

    // Test 3: Try to create a test user (with transaction)
    const testEmail = `test-${Date.now()}@trajectory.test`
    const hashedPassword = await bcrypt.hash("Test1234!", 10)

    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: "Test User",
          email: testEmail,
          password: hashedPassword,
        }
      })

      // Create company
      const company = await tx.company.create({
        data: {
          name: "Test Company",
          plan: "trial",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        }
      })

      // Link user to company
      await tx.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: "owner",
        }
      })

      // Clean up test data
      await tx.companyMember.deleteMany({
        where: { userId: user.id }
      })
      await tx.company.delete({
        where: { id: company.id }
      })
      await tx.user.delete({
        where: { id: user.id }
      })

      return { user, company }
    })

    return NextResponse.json({
      success: true,
      message: "✅ All registration tests passed!",
      details: {
        databaseConnected: true,
        userCount,
        transactionTest: "Success",
        testUserId: result.user.id,
      }
    })

  } catch (error: any) {
    console.error("❌ Registration test failed:", error)

    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      details: {
        name: error.name,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5),
      }
    }, { status: 500 })
  }
}
