// @ts-nocheck - Deno project with .ts imports
// Supabase Edge Function: Create Payment Intent
// Creates a Stripe payment intent for in-app purchases with proper security and validation

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

// Shared utilities
import { loadEnvironment } from '../_shared/env.ts'
import { initializeClients } from '../_shared/clients.ts'
import { getCorsHeaders, handlePreFlight } from '../_shared/cors.ts'
import { createErrorResponse, validationError, rateLimitError } from '../_shared/error-handler.ts'
import { createLogger } from '../_shared/logger.ts'
import { parseJSON, validateMethod } from '../_shared/request.ts'
import { getGlobalRateLimiter, createRateLimitHeaders } from '../_shared/rate-limit.ts'
import {
  validatePaymentAmount,
  validatePlanId,
  validateCurrency,
  validateUUID,
  type PlanId,
  type Currency,
} from '../_shared/validation.ts'

// Initialize logger
const logger = createLogger('create-payment-intent')

// Initialize rate limiter (5 requests per minute)
const rateLimiter = getGlobalRateLimiter({ windowMs: 60 * 1000, maxRequests: 5 })

interface RequestBody {
  amount: number
  currency: string
  planId: string
  deviceId: string
  userId?: string
  chatId?: string
  idempotencyKey?: string
}

/**
 * Validate request body fields
 */
function validateRequestBody(body: RequestBody): void {
  // Validate required fields
  if (!body.amount || !body.currency || !body.planId || !body.deviceId) {
    throw validationError('Missing required fields: amount, currency, planId, deviceId')
  }

  // Validate types
  if (typeof body.amount !== 'number' || typeof body.currency !== 'string' ||
      typeof body.planId !== 'string' || typeof body.deviceId !== 'string') {
    throw validationError('Invalid field types')
  }

  // Validate specific fields
  validatePaymentAmount(body.amount)
  validateCurrency(body.currency)
  validatePlanId(body.planId)
  validateUUID(body.deviceId, 'deviceId')

  // Validate optional fields
  if (body.userId) {
    validateUUID(body.userId, 'userId')
  }

  if (body.chatId && typeof body.chatId !== 'string') {
    throw validationError('Invalid chatId format')
  }
}

/**
 * Get or create Stripe customer
 */
async function getOrCreateCustomer(
  stripe: Stripe,
  supabase: ReturnType<typeof initializeClients>['supabase'],
  deviceId: string,
  planId: string
): Promise<Stripe.Customer> {
  // Try to retrieve existing Stripe customer ID
  const { data: existingEntitlements, error: dbError } = await supabase
    .from('user_entitlements')
    .select('stripe_customer_id')
    .eq('device_id', deviceId)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)

  if (dbError) {
    logger.error('Database error', dbError)
    throw new Error('Service temporarily unavailable')
  }

  let customerId = existingEntitlements?.[0]?.stripe_customer_id

  // Verify existing customer in Stripe
  if (customerId) {
    try {
      const existingCustomer = await stripe.customers.retrieve(customerId)
      // Check if customer is not deleted
      if ('deleted' in existingCustomer && existingCustomer.deleted) {
        logger.info('Customer was deleted in Stripe, creating new one')
        customerId = null
      }
    } catch (error) {
      logger.info('Customer not found in Stripe, creating new one')
      customerId = null
    }
  }

  // Create or retrieve customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        deviceId,
        planId,
        environment: 'production',
      },
    })
    logger.info('New customer created', { customerId: customer.id.substring(0, 10) + '...' })
    return customer
  } else {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    logger.info('Using existing customer', { customerId: customerId.substring(0, 10) + '...' })
    return customer
  }
}

serve(async (req: Request) => {
  const startTime = Date.now()

  try {
    // Load environment
    const env = loadEnvironment(['stripeSecretKey', 'supabaseUrl', 'supabaseServiceKey'])

    // Initialize clients
    const { stripe, supabase } = initializeClients(env)

    // Handle CORS
    const origin = req.headers.get('origin')
    const corsHeaders = getCorsHeaders(origin, {
      allowedOrigins: env.allowedOrigins,
      methods: ['POST', 'OPTIONS'],
    })

    // Handle preflight
    const preflight = handlePreFlight(req, corsHeaders)
    if (preflight) return preflight

    // Validate method
    validateMethod(req, ['POST'])

    // Parse request body
    const body = await parseJSON<RequestBody>(req)
    const { amount, currency, planId, deviceId, userId, chatId, idempotencyKey } = body

    logger.info('Request received', {
      planId,
      deviceId: deviceId.substring(0, 8) + '...',
      userId: userId ? userId.substring(0, 8) + '...' : undefined,
      chatId: chatId ? chatId.substring(0, 8) + '...' : undefined,
    })

    // Validate input
    validateRequestBody(body)

    // Check rate limit
    const rateLimitKey = userId || deviceId
    const rateLimitResult = rateLimiter.check(rateLimitKey)

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', { identifier: rateLimitKey })
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult, { windowMs: 60000, maxRequests: 5 })

      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get or create customer
    const customer = await getOrCreateCustomer(stripe, supabase, deviceId, planId)

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
      customer: customer.id,
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

    const duration = Date.now() - startTime
    logger.info('Payment intent created', {
      paymentIntentId: paymentIntent.id,
      duration,
    })

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
    const duration = Date.now() - startTime
    logger.error('Request failed', { error, duration })
    return createErrorResponse(error, {
      corsHeaders: getCorsHeaders(req.headers.get('origin'), {
        allowedOrigins: loadEnvironment([]).allowedOrigins,
      }),
      includeCode: true,
    })
  }
})
