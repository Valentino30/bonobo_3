// @ts-nocheck - Deno project with .ts imports
// Error handling utilities
// Provides consistent error responses across Edge Functions

// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

export interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, any>
}

export interface ErrorHandlerOptions {
  corsHeaders?: HeadersInit
  includeDetails?: boolean
  includeCode?: boolean
}

export type ErrorType = 'validation' | 'authentication' | 'payment' | 'database' | 'rate_limit' | 'internal'

/**
 * Custom error class for Edge Functions
 */
export class EdgeFunctionError extends Error {
  constructor(
    public type: ErrorType,
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'EdgeFunctionError'
  }
}

/**
 * Map Stripe errors to HTTP status codes and messages
 * @param error - Stripe error object
 * @returns Object with status code and message
 */
export function mapStripeErrorToStatus(error: any): { status: number; message: string } {
  // @ts-ignore: Stripe types
  if (!(error instanceof Stripe.errors.StripeError)) {
    return { status: 500, message: 'An unexpected error occurred' }
  }

  switch (error.type) {
    case 'StripeCardError':
      return { status: 400, message: 'Card error' }
    case 'RateLimitError':
      return { status: 429, message: 'Too many requests to payment provider' }
    case 'StripeInvalidRequestError':
      return { status: 400, message: 'Invalid payment request' }
    case 'StripeAuthenticationError':
      return { status: 401, message: 'Authentication failed' }
    case 'StripeConnectionError':
      return { status: 502, message: 'Payment service connection error' }
    case 'StripeAPIError':
      return { status: 502, message: 'Payment service error' }
    default:
      return { status: 502, message: 'Payment service error' }
  }
}

/**
 * Create a standardized error response
 * @param error - Error object (any type)
 * @param options - Options for error response formatting
 * @returns Response object with error details
 */
export function createErrorResponse(
  error: unknown,
  options: ErrorHandlerOptions = {}
): Response {
  const { corsHeaders = {}, includeDetails = false, includeCode = true } = options

  let statusCode = 500
  let errorMessage = 'An unexpected error occurred'
  let errorType: ErrorType = 'internal'
  let details: Record<string, any> | undefined

  // Handle custom EdgeFunctionError
  if (error instanceof EdgeFunctionError) {
    statusCode = error.statusCode
    errorMessage = error.message
    errorType = error.type
    details = error.details
  }
  // Handle Stripe errors
  // @ts-ignore: Stripe types
  else if (error instanceof Stripe.errors.StripeError) {
    const { status, message } = mapStripeErrorToStatus(error)
    statusCode = status
    errorMessage = message
    errorType = 'payment'
  }
  // Handle standard errors
  else if (error instanceof Error) {
    errorMessage = error.message

    // Try to infer error type from message
    if (errorMessage.toLowerCase().includes('validation') || errorMessage.toLowerCase().includes('invalid')) {
      errorType = 'validation'
      statusCode = 400
    } else if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('authentication')) {
      errorType = 'authentication'
      statusCode = 401
    } else if (errorMessage.toLowerCase().includes('database')) {
      errorType = 'database'
      statusCode = 500
    } else if (errorMessage.toLowerCase().includes('rate limit')) {
      errorType = 'rate_limit'
      statusCode = 429
    }
  }

  const response: ErrorResponse = {
    error: errorMessage,
    ...(includeCode && { code: errorType.toUpperCase() }),
    ...(includeDetails && details && { details }),
  }

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Log error with context
 * @param error - Error object
 * @param context - Additional context for logging
 */
export function logError(
  error: unknown,
  context?: Record<string, any>
): void {
  const timestamp = new Date().toISOString()

  if (error instanceof Error) {
    console.error(`[${timestamp}] Error: ${error.message}`, context || {})
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`)
    }
  } else {
    console.error(`[${timestamp}] Error:`, error, context || {})
  }
}

/**
 * Create a validation error
 * @param message - Error message
 * @param field - Field that failed validation
 * @returns EdgeFunctionError
 */
export function validationError(message: string, field?: string): EdgeFunctionError {
  return new EdgeFunctionError(
    'validation',
    400,
    message,
    field ? { field } : undefined
  )
}

/**
 * Create a rate limit error
 * @param message - Error message
 * @param retryAfter - Seconds until retry is allowed
 * @returns EdgeFunctionError
 */
export function rateLimitError(message: string = 'Rate limit exceeded', retryAfter?: number): EdgeFunctionError {
  return new EdgeFunctionError(
    'rate_limit',
    429,
    message,
    retryAfter ? { retryAfter } : undefined
  )
}

/**
 * Create a database error
 * @param message - Error message
 * @returns EdgeFunctionError
 */
export function databaseError(message: string = 'Database error'): EdgeFunctionError {
  return new EdgeFunctionError('database', 500, message)
}
