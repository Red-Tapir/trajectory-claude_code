import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create a Redis instance for rate limiting
// If UPSTASH credentials are not available, create a mock implementation for development
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Rate limit for API endpoints: 10 requests per 10 seconds
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit:api",
    })
  : null

// Rate limit for authentication endpoints: 5 requests per minute
export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:auth",
    })
  : null

// Rate limit for email sending: 3 emails per minute
export const emailLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:email",
    })
  : null

// Rate limit for organization creation: 3 organizations per day
export const orgCreationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 d"),
      analytics: true,
      prefix: "@upstash/ratelimit:org-creation",
    })
  : null

// Rate limit for member invitations: 20 invitations per hour per organization
export const invitationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "@upstash/ratelimit:invitation",
    })
  : null

// Helper function to get client identifier (IP address or session ID)
export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")
  return ip || "anonymous"
}

// Helper function to check rate limit
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!limiter) {
    // If rate limiting is not configured (development), allow all requests
    return { success: true }
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
  }
}
