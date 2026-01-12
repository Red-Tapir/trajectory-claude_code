import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Scrub sensitive data before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null
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

    return event
  },
})
