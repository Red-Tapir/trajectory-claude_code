import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createOrganization, getUserOrganizations } from "@/lib/organization"
import { z } from "zod"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { orgCreationLimiter, checkRateLimit } from "@/lib/rate-limit"

const organizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  plan: z.enum(["trial", "starter", "growth", "enterprise"]).default("trial"),
})

// GET user's organizations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizations = await getUserOrganizations(session.user.id)

    return NextResponse.json({ organizations })

  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des organisations" },
      { status: 500 }
    )
  }
}

// POST create new organization
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check rate limit (3 organizations per day per user)
    const rateLimitResult = await checkRateLimit(
      orgCreationLimiter,
      `org-creation:${session.user.id}`
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Limite de création d'organisations atteinte. Vous pouvez créer jusqu'à 3 organisations par jour.",
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
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
    const validatedData = organizationSchema.parse(body)

    const organization = await createOrganization({
      name: validatedData.name,
      userId: session.user.id,
      plan: validatedData.plan,
    })

    // Log audit
    await logAudit({
      organizationId: organization.id,
      userId: session.user.id,
      action: AUDIT_ACTIONS.ORGANIZATION_CREATED,
      resource: "organization",
      resourceId: organization.id,
      metadata: {
        name: organization.name,
        plan: organization.plan,
      },
    })

    return NextResponse.json(organization, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating organization:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'organisation" },
      { status: 500 }
    )
  }
}
