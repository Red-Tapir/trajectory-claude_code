import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { switchOrganization } from "@/lib/organization"
import { z } from "zod"

const switchSchema = z.object({
  organizationId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { organizationId } = switchSchema.parse(body)

    // Switch to the new organization
    await switchOrganization({
      userId: session.user.id,
      organizationId,
    })

    // Trigger session update
    return NextResponse.json({
      success: true,
      message: "Organisation changée avec succès"
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error switching organization:", error)
    return NextResponse.json(
      { error: "Erreur lors du changement d'organisation" },
      { status: 500 }
    )
  }
}
