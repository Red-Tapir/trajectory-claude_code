import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

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
    "Non autorisé",
    "Permission refusée",
    // Rate limiting
    "Trop de tentatives",
    "Limite atteinte",
    // Non-error exceptions
    "Non-Error exception captured",
    "Non-Error promise rejection captured",
    // Network
    "ECONNREFUSED",
    "ETIMEDOUT",
  ],

  // Filter out health check and scrub sensitive data before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out health check and monitoring requests
    const url = event.request?.url
    if (url && (url.includes("/api/health") || url.includes("/api/ping"))) {
      return null
    }

    // Remove sensitive data from context
    if (event.contexts?.user) {
      delete event.contexts.user.email
      delete event.contexts.user.ip_address
    }

    // Remove cookies
    if (event.request?.cookies) {
      delete event.request.cookies
    }

    // Remove authorization headers
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }

    // Remove environment variables that might contain secrets
    const sensitiveEnvVars = [
      'DATABASE_URL',
      'DIRECT_URL',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'RESEND_API_KEY',
      'UPSTASH_REDIS_REST_TOKEN',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_SECRET',
      'SENTRY_AUTH_TOKEN',
    ]

    // Scrub extras
    if (event.extra) {
      Object.keys(event.extra).forEach(key => {
        const value = event.extra?.[key]
        if (typeof value === 'string') {
          sensitiveEnvVars.forEach(envVar => {
            const envValue = process.env[envVar]
            if (envValue && value.includes(envValue)) {
              event.extra![key] = value.replace(envValue, '[REDACTED]')
            }
          })
        }
      })
    }

    return event
  },
})
