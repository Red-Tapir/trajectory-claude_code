import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Random plugins/extensions
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    // Network errors
    "NetworkError",
    "Network request failed",
    "Failed to fetch",
    // Non-error exceptions
    "Non-Error exception captured",
    "Non-Error promise rejection captured",
    // ResizeObserver
    "ResizeObserver loop limit exceeded",
  ],

  // Scrub sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Remove cookies from request data
    if (event.request?.cookies) {
      delete event.request.cookies
    }

    // Remove authorization headers
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }

    // Remove sensitive query parameters
    if (event.request?.query_string) {
      const sensitiveParams = ['token', 'password', 'secret', 'api_key', 'apikey', 'apiKey']
      sensitiveParams.forEach(param => {
        if (event.request?.query_string?.includes(param)) {
          event.request.query_string = event.request.query_string.replace(
            new RegExp(`${param}=[^&]*`, 'gi'),
            `${param}=[REDACTED]`
          )
        }
      })
    }

    return event
  },
})
