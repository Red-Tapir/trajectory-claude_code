import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendInvoiceEmail } from "@/lib/email"
import { emailLimiter, getClientIdentifier, checkRateLimit } from "@/lib/rate-limit"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Check rate limit for email sending
    const identifier = getClientIdentifier(req)
    const rateLimitResult = await checkRateLimit(emailLimiter, identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop d'emails envoyés. Veuillez réessayer plus tard." },
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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        company: {
          members: {
            some: {
              userId: session.user.id,
            }
          }
        }
      },
      include: {
        client: true,
        company: true,
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    if (!invoice.client.email) {
      return NextResponse.json(
        { error: "Le client n'a pas d'adresse email" },
        { status: 400 }
      )
    }

    // Send invoice email
    const result = await sendInvoiceEmail({
      to: invoice.client.email,
      invoiceNumber: invoice.number,
      clientName: invoice.client.name,
      total: invoice.total,
      currency: invoice.currency,
      pdfUrl: invoice.pdfUrl || undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      )
    }

    // Update invoice status to sent
    await prisma.invoice.update({
      where: { id: params.id },
      data: { status: 'sent' }
    })

    return NextResponse.json({
      message: "Email envoyé avec succès",
      data: result.data
    })
  } catch (error) {
    console.error("Error sending invoice email:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi de l'email" },
      { status: 500 }
    )
  }
}
