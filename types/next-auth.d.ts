import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      currentOrganizationId?: string
      organization?: {
        id: string
        name: string
        slug: string
        logo: string | null
        plan: string
      }
      role?: {
        name: string
        displayName: string
        priority: number
      }
    }
  }

  interface User {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    currentOrganizationId?: string
  }
}
