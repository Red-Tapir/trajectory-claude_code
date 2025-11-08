import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore specific errors
  ignoreErrors: [
    // Database errors that are handled
    "P2002", // Prisma unique constraint
    "P2025", // Prisma record not found
    // Authentication errors
    "CredentialsSignin",
    "Email ou mot de passe incorrect",
    // Non-error exceptions
    "Non-Error exception captured",
    "Non-Error promise rejection captured",
  ],

  // Filter out health check and monitoring requests
  beforeSend(event, hint) {
    const url = event.request?.url
    if (url && (url.includes("/api/health") || url.includes("/api/ping"))) {
      return null
    }
    return event
  },
})
