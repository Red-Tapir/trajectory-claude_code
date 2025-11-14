import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Route temporaire pour initialiser la base de données
 * À supprimer après utilisation pour des raisons de sécurité
 *
 * Pour l'utiliser : GET /api/db/init?secret=votre_secret_temporaire
 */
export async function GET(req: NextRequest) {
  try {
    // Simple protection (à améliorer en production)
    const secret = req.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.DB_INIT_SECRET || 'change-me-in-production'

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Vérifier la connexion à la base de données
    await prisma.$connect()

    // Exécuter un simple query pour vérifier que tout fonctionne
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`

    return NextResponse.json({
      success: true,
      message: 'Database connection successful! Now run: npx prisma db push from your local machine with production DATABASE_URL',
      dbInfo: result,
      instructions: [
        '1. Copy your DATABASE_URL from Vercel environment variables',
        '2. In your terminal, run: DATABASE_URL="your_database_url" npx prisma db push',
        '3. This will create all tables in your Supabase database',
        '4. Delete this API route after initialization for security'
      ]
    })

  } catch (error: any) {
    console.error('Database init error:', error)
    return NextResponse.json(
      {
        error: 'Database initialization failed',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}
