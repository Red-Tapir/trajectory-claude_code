import * as Sentry from "@sentry/nextjs"

// Only initialize Sentry if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    environment: process.env.NODE_ENV,
    ignoreErrors: [
      "P2002",
      "P2025",
      "CredentialsSignin",
      "Email ou mot de passe incorrect",
      "Non-Error exception captured",
      "Non-Error promise rejection captured",
    ],
    beforeSend(event) {
      const url = event.request?.url
      if (url && (url.includes("/api/health") || url.includes("/api/ping"))) {
        return null
      }
      return event
    },
  })
}
