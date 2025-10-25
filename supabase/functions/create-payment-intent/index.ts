// Supabase Edge Function: Create Payment Intent
// Creates a Stripe payment intent for in-app purchases with proper security and validation

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
// @ts-ignore: Deno-specific imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Environment variables
// @ts-ignore: Deno global
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
// @ts-ignore: Deno global
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
// @ts-ignore: Deno global
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
// @ts-ignore: Deno global
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:*'

// Validate environment variables
if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables')
}

// Initialize clients
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Constants for validation
const VALID_PLANS = ['one-time', 'weekly', 'monthly'] as const
const VALID_CURRENCIES = ['eur'] as const // Your app only supports EUR
const MIN_AMOUNT = 50 // 50 cents minimum (Stripe requirement)
const MAX_AMOUNT = 100000 // €1000 maximum (reasonable limit)

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5 // Max 5 requests per minute per device

interface RequestBody {
  amount: number
  currency: string
  planId: string
  deviceId: string
  userId?: string
  chatId?: string
  idempotencyKey?: string
}

// Helper function to validate CORS origin
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedPatterns = ALLOWED_ORIGINS.split(',').map(p => p.trim())
  return allowedPatterns.some(pattern => {
    // Convert wildcard pattern to regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/:/g, '\\:')
    return new RegExp(`^${regexPattern}$`).test(origin)
  })
}

// Helper function to get CORS headers
function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Only set origin if it's allowed
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  return headers
}

// Rate limiting function
function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)

  if (!limit || limit.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }

  limit.count++
  return true
}

// Input validation function
function validateInput(body: RequestBody): string | null {
  // Required fields
  if (!body.amount || !body.currency || !body.planId || !body.deviceId) {
    return 'Missing required fields: amount, currency, planId, deviceId'
  }

  // Type validation
  if (typeof body.amount !== 'number' || typeof body.currency !== 'string' ||
      typeof body.planId !== 'string' || typeof body.deviceId !== 'string') {
    return 'Invalid field types'
  }

  // Amount validation
  if (!Number.isInteger(body.amount)) {
    return 'Amount must be an integer (in cents)'
  }

  if (body.amount < MIN_AMOUNT) {
    return `Amount must be at least ${MIN_AMOUNT} cents`
  }

  if (body.amount > MAX_AMOUNT) {
    return `Amount cannot exceed ${MAX_AMOUNT} cents (€${MAX_AMOUNT / 100})`
  }

  // Currency validation
  if (!VALID_CURRENCIES.includes(body.currency.toLowerCase() as any)) {
    return `Invalid currency. Supported currencies: ${VALID_CURRENCIES.join(', ')}`
  }

  // Plan validation
  if (!VALID_PLANS.includes(body.planId as any)) {
    return `Invalid plan. Valid plans: ${VALID_PLANS.join(', ')}`
  }

  // Device ID validation (should be UUID)
  if (!UUID_REGEX.test(body.deviceId)) {
    return 'Invalid deviceId format (must be UUID)'
  }

  // User ID validation (if provided)
  if (body.userId && !UUID_REGEX.test(body.userId)) {
    return 'Invalid userId format (must be UUID)'
  }

  // Chat ID validation (if provided)
  if (body.chatId && typeof body.chatId !== 'string') {
    return 'Invalid chatId format'
  }

  return null // No validation errors
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Parse request body
    let body: RequestBody
    try {
      body = await req.json() as RequestBody
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { amount, currency, planId, deviceId, userId, chatId, idempotencyKey } = body

    // Validate input
    const validationError = validateInput(body)
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check rate limit
    const rateLimitKey = userId || deviceId
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating payment intent:', {
      amount,
      currency: currency.toLowerCase(),
      planId,
      deviceId: deviceId.substring(0, 8) + '...', // Log partial ID for privacy
      userId: userId ? userId.substring(0, 8) + '...' : undefined,
      chatId: chatId ? chatId.substring(0, 8) + '...' : undefined
    })

    // Try to retrieve existing Stripe customer ID
    const { data: existingEntitlements, error: dbError } = await supabase
      .from('user_entitlements')
      .select('stripe_customer_id')
      .eq('device_id', deviceId)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let customerId = existingEntitlements?.[0]?.stripe_customer_id

    // Verify existing customer in Stripe
    if (customerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId)
        // Check if customer is not deleted
        if ('deleted' in existingCustomer && existingCustomer.deleted) {
          console.log('Customer was deleted in Stripe, creating new one')
          customerId = null
        }
      } catch (error) {
        console.log('Customer not found in Stripe, creating new one')
        customerId = null
      }
    }

    // Create or retrieve customer
    let customer: Stripe.Customer
    if (!customerId) {
      customer = await stripe.customers.create({
        metadata: {
          deviceId,
          planId,
          environment: 'production',
        },
      })
      customerId = customer.id
      console.log('New customer created:', customerId.substring(0, 10) + '...')
    } else {
      customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      console.log('Using existing customer:', customerId.substring(0, 10) + '...')
    }

    // Create ephemeral key for customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-11-20.acacia' }
    )

    // Build metadata for webhook
    const metadata: Record<string, string> = {
      planId,
      deviceId,
      environment: 'production',
    }

    if (userId) {
      metadata.userId = userId
    }

    if (chatId && planId === 'one-time') {
      metadata.chatId = chatId
    }

    // Create payment intent options
    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: 'off_session',
      description: `${planId} plan purchase`,
    }

    // Add idempotency key if provided
    const requestOptions: Stripe.RequestOptions = {}
    if (idempotencyKey) {
      requestOptions.idempotencyKey = `${deviceId}-${idempotencyKey}`
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentOptions,
      requestOptions
    )

    console.log('Payment intent created:', paymentIntent.id)

    // Return success response
    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: null, // Don't expose this in production
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    // Log full error for debugging
    console.error('Unexpected error:', error)

    // Determine error type and status code
    let statusCode = 500
    let errorMessage = 'An unexpected error occurred'

    if (error instanceof Stripe.errors.StripeError) {
      // Handle Stripe-specific errors
      switch (error.type) {
        case 'StripeCardError':
          statusCode = 400
          errorMessage = 'Card error'
          break
        case 'RateLimitError':
          statusCode = 429
          errorMessage = 'Too many requests to payment provider'
          break
        case 'StripeInvalidRequestError':
          statusCode = 400
          errorMessage = 'Invalid payment request'
          break
        default:
          statusCode = 502
          errorMessage = 'Payment service error'
      }
    }

    // Return sanitized error response
    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: statusCode === 500 ? 'INTERNAL_ERROR' : 'PAYMENT_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})