import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email"
import { authLimiter, getClientIdentifier, checkRateLimit } from "@/lib/rate-limit"

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  company: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
})

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const identifier = getClientIdentifier(req)
    const rateLimitResult = await checkRateLimit(authLimiter, identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "",
            "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "",
            "X-RateLimit-Reset": rateLimitResult.reset?.toString() || "",
          },
        }
      )
    }

    const body = await req.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          password: hashedPassword,
        }
      })

      // Create company
      const company = await tx.company.create({
        data: {
          name: validatedData.company,
          plan: "trial", // Plan d'essai gratuit par défaut
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
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

      return { user, company }
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      to: result.user.email,
      name: result.user.name || 'Utilisateur',
    }).catch(err => console.error('Failed to send welcome email:', err))

    return NextResponse.json({
      message: "Compte créé avec succès",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    // Log detailed error information for debugging
    console.error("Registration error:", error)
    console.error("Error type:", error?.constructor?.name)
    console.error("Error message:", (error as Error)?.message)
    console.error("Error stack:", (error as Error)?.stack)
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)))

    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any; message: string }
      console.error("Prisma error code:", prismaError.code)
      console.error("Prisma error meta:", prismaError.meta)

      // Handle specific Prisma error codes
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: "Un compte avec cet email existe déjà" },
          { status: 400 }
        )
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: "Erreur de relation dans la base de données" },
          { status: 500 }
        )
      }
      if (prismaError.code === 'P1001' || prismaError.code === 'P1002') {
        return NextResponse.json(
          { error: "Impossible de se connecter à la base de données" },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la création du compte",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
