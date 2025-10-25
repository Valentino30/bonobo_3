// @ts-nocheck - Deno project with .ts imports
// CORS handling utilities
// Provides consistent CORS configuration across Edge Functions

export interface CorsOptions {
  allowedOrigins?: string
  allowCredentials?: boolean
  methods?: string[]
  headers?: string[]
}

/**
 * Check if an origin is allowed based on configured patterns
 * @param origin - Request origin header
 * @param allowedOrigins - Comma-separated list of allowed origin patterns (supports wildcards)
 * @returns True if origin is allowed
 */
export function isAllowedOrigin(origin: string | null, allowedOrigins?: string): boolean {
  if (!origin || !allowedOrigins) return false

  // Allow wildcard
  if (allowedOrigins === '*') return true

  const allowedPatterns = allowedOrigins.split(',').map(p => p.trim())
  return allowedPatterns.some(pattern => {
    // Convert wildcard pattern to regex
    // Example: http://localhost:* becomes http://localhost:.*
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/:/g, '\\:')
    return new RegExp(`^${regexPattern}$`).test(origin)
  })
}

/**
 * Get CORS headers for a request
 * @param origin - Request origin header
 * @param options - CORS configuration options
 * @returns Headers object with CORS headers
 */
export function getCorsHeaders(
  origin: string | null,
  options: CorsOptions = {}
): HeadersInit {
  const {
    allowedOrigins,
    allowCredentials = true,
    methods = ['POST', 'GET', 'OPTIONS'],
    headers = ['authorization', 'x-client-info', 'apikey', 'content-type'],
  } = options

  const corsHeaders: HeadersInit = {
    'Access-Control-Allow-Headers': headers.join(', '),
    'Access-Control-Allow-Methods': methods.join(', '),
  }

  // Set origin header if allowed
  if (allowedOrigins === '*') {
    corsHeaders['Access-Control-Allow-Origin'] = '*'
  } else if (isAllowedOrigin(origin, allowedOrigins)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin!
    if (allowCredentials) {
      corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    }
  }

  return corsHeaders
}

/**
 * Handle CORS preflight (OPTIONS) request
 * @param req - Request object
 * @param corsHeaders - CORS headers to return
 * @returns Response for preflight request, or null if not a preflight
 */
export function handlePreFlight(
  req: Request,
  corsHeaders: HeadersInit
): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}

/**
 * Create a complete CORS-enabled response
 * @param body - Response body
 * @param corsHeaders - CORS headers
 * @param options - Additional response options
 * @returns Response with CORS headers
 */
export function createCorsResponse(
  body: string | null,
  corsHeaders: HeadersInit,
  options: ResponseInit = {}
): Response {
  return new Response(body, {
    ...options,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}
