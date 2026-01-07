// lib/rate-limit-types.ts
// Type definitions for rate limiting - safe to import in client components

export type RateLimitResult = {
  allowed: boolean
  limit?: number
  remaining?: number
  resetAt?: Date
  message?: string
}