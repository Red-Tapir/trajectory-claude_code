/**
 * Cache control headers for API responses
 */

export const cacheHeaders = {
  // No caching - for dynamic/sensitive data
  noCache: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  // Short cache - 1 minute (for frequently changing data)
  shortCache: {
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
  },

  // Medium cache - 5 minutes (for moderate frequency data)
  mediumCache: {
    'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
  },

  // Long cache - 1 hour (for rarely changing data)
  longCache: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=300',
  },

  // Static cache - 1 year (for immutable static assets)
  staticCache: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
}

/**
 * Revalidation intervals for Next.js ISR
 */
export const revalidate = {
  minute: 60,
  fiveMinutes: 300,
  hour: 3600,
  day: 86400,
  week: 604800,
}
