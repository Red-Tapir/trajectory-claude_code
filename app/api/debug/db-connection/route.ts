import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {}
  }

  // Check 1: Environment variables
  debugInfo.checks.envVariables = {
    DATABASE_URL_exists: !!process.env.DATABASE_URL,
    DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 30) + '...',
    DIRECT_DATABASE_URL_exists: !!process.env.DIRECT_DATABASE_URL,
    DIRECT_DATABASE_URL_preview: process.env.DIRECT_DATABASE_URL?.substring(0, 30) + '...',
  }

  // Check 2: Database connection
  try {
    await prisma.$connect()
    debugInfo.checks.databaseConnection = {
      status: 'success',
      message: 'Successfully connected to database'
    }

    // Check 3: Can we query?
    try {
      const userCount = await prisma.user.count()
      debugInfo.checks.databaseQuery = {
        status: 'success',
        message: `Successfully queried database. User count: ${userCount}`
      }
    } catch (queryError: any) {
      debugInfo.checks.databaseQuery = {
        status: 'error',
        message: queryError.message,
        code: queryError.code
      }
    }

    // Check 4: Can we use transactions?
    try {
      await prisma.$transaction(async (tx) => {
        const count = await tx.company.count()
        return count
      })
      debugInfo.checks.databaseTransaction = {
        status: 'success',
        message: 'Transaction support is working'
      }
    } catch (txError: any) {
      debugInfo.checks.databaseTransaction = {
        status: 'error',
        message: txError.message,
        code: txError.code,
        hint: 'This error suggests DIRECT_DATABASE_URL is not configured correctly'
      }
    }

  } catch (connectionError: any) {
    debugInfo.checks.databaseConnection = {
      status: 'error',
      message: connectionError.message,
      code: connectionError.code
    }
  } finally {
    await prisma.$disconnect()
  }

  // Summary
  const allPassed = Object.values(debugInfo.checks).every(
    (check: any) => check.status === 'success'
  )

  debugInfo.summary = {
    allChecksPassed: allPassed,
    recommendation: allPassed
      ? 'All checks passed! Registration should work now.'
      : 'Some checks failed. Please configure DIRECT_DATABASE_URL in Vercel.'
  }

  return NextResponse.json(debugInfo, {
    status: allPassed ? 200 : 500,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
