import { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { createOrganization } from "@/lib/organization"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            memberships: {
              include: {
                organization: true
              }
            }
          }
        })

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect")
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          image: user.image,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/connexion",
    signOut: "/",
    error: "/connexion",
  },
  events: {
    async createUser({ user }) {
      // Automatically create organization for new users (OAuth signup)
      console.log('New user created via OAuth:', user.email)

      const existingMemberships = await prisma.organizationMember.findMany({
        where: { userId: user.id }
      })

      // Only create org if user doesn't already have one
      if (existingMemberships.length === 0) {
        const organizationName = user.name
          ? `${user.name}'s Organization`
          : `${user.email}'s Organization`

        await createOrganization({
          name: organizationName,
          userId: user.id,
          plan: 'trial'
        })

        console.log('Created organization for user:', user.email)
      }
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
      }

      // Refresh currentOrganizationId on every JWT creation
      if (token.id) {
        const userData = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            currentOrganizationId: true,
            memberships: {
              where: { status: 'active' },
              take: 1,
              orderBy: { createdAt: 'asc' }
            }
          }
        })

        if (userData) {
          // If no current org set, use first membership
          if (!userData.currentOrganizationId && userData.memberships.length > 0) {
            const firstOrg = userData.memberships[0].organizationId
            await prisma.user.update({
              where: { id: userData.id },
              data: { currentOrganizationId: firstOrg }
            })
            token.currentOrganizationId = firstOrg
          } else {
            token.currentOrganizationId = userData.currentOrganizationId ?? undefined
          }
        }
      }

      // Allow updating session from client
      if (trigger === "update" && session?.currentOrganizationId) {
        token.currentOrganizationId = session.currentOrganizationId
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.currentOrganizationId = token.currentOrganizationId as string | undefined

        // Fetch organization details
        if (session.user.currentOrganizationId) {
          const org = await prisma.organization.findUnique({
            where: { id: session.user.currentOrganizationId },
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              plan: true
            }
          })

          if (org) {
            session.user.organization = org
          }

          // Fetch user's role in current organization
          const membership = await prisma.organizationMember.findUnique({
            where: {
              organizationId_userId: {
                organizationId: session.user.currentOrganizationId,
                userId: session.user.id
              }
            },
            include: {
              role: {
                select: {
                  name: true,
                  displayName: true,
                  priority: true
                }
              }
            }
          })

          if (membership) {
            session.user.role = membership.role
          }
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
