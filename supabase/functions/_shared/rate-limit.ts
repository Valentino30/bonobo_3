// @ts-nocheck - Deno project with .ts imports
// Rate limiting utilities
// Provides request rate limiting for Edge Functions

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export interface RateLimitStore {
  count: number
  resetTime: number
}

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  remaining?: number
}

/**
 * Rate limiter class with in-memory storage
 * Note: In production with multiple Edge Function instances,
 * consider using Redis or Supabase for distributed rate limiting
 */
export class RateLimiter {
  private store = new Map<string, RateLimitStore>()
  private config: RateLimitConfig
  private cleanupInterval: number

  constructor(config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 5 }) {
    this.config = config

    // Clean up expired entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), config.windowMs * 2)
  }

  /**
   * Check if a request is allowed based on rate limit
   * @param identifier - Unique identifier (e.g., device ID, IP address)
   * @returns Rate limit result with allowed status and retry info
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const limit = this.store.get(identifier)

    // No previous requests or window expired - allow and create new window
    if (!limit || limit.resetTime < now) {
      this.store.set(identifier, { count: 1, resetTime: now + this.config.windowMs })
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
      }
    }

    // Max requests reached - deny with retry info
    if (limit.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000)
      return {
        allowed: false,
        retryAfter,
        remaining: 0,
      }
    }

    // Increment count and allow
    limit.count++
    return {
      allowed: true,
      remaining: this.config.maxRequests - limit.count,
    }
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Identifier to reset
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Get current rate limit status for an identifier
   * @param identifier - Identifier to check
   * @returns Current count and reset time, or null if no limit exists
   */
  getStatus(identifier: string): RateLimitStore | null {
    return this.store.get(identifier) || null
  }

  /**
   * Stop the cleanup interval (call when shutting down)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}

/**
 * Create HTTP headers for rate limit info
 * @param result - Rate limit result
 * @param config - Rate limit configuration
 * @returns Headers object with rate limit info
 */
export function createRateLimitHeaders(result: RateLimitResult, config?: RateLimitConfig): HeadersInit {
  const headers: HeadersInit = {}

  if (config) {
    headers['X-RateLimit-Limit'] = config.maxRequests.toString()
  }

  if (result.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = result.remaining.toString()
  }

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString()
    headers['X-RateLimit-Reset'] = new Date(Date.now() + result.retryAfter * 1000).toISOString()
  }

  return headers
}

/**
 * Create a singleton rate limiter instance
 * Useful for sharing one rate limiter across multiple requests
 */
let globalRateLimiter: RateLimiter | null = null

export function getGlobalRateLimiter(config?: RateLimitConfig): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(config)
  }
  return globalRateLimiter
}
