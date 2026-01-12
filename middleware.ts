import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/connexion",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/clients/:path*",
    "/api/invoices/:path*",
    "/api/budgets/:path*",
    "/api/organizations/:path*",
    "/api/subscription/:path*",
    "/api/dashboard/:path*",
    "/api/stripe/checkout",
    "/api/stripe/portal",
  ],
}
