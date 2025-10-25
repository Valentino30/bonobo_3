// @ts-nocheck - Deno project with .ts imports
// Verify Payment and Create Entitlement
// Fallback endpoint to manually verify payment and create entitlement if webhook failed

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Shared utilities
import { loadEnvironment } from '../_shared/env.ts'
import { initializeClients } from '../_shared/clients.ts'
import { createErrorResponse, validationError } from '../_shared/error-handler.ts'
import { createLogger } from '../_shared/logger.ts'
import { parseJSON, validateMethod } from '../_shared/request.ts'
import { validatePaymentIntentId, validateUUID, validatePlanId, type PlanId } from '../_shared/validation.ts'
import {
  calculatePlanExpiration,
  createEntitlement,
  findExistingEntitlement,
  type EntitlementData,
} from '../_shared/entitlement.ts'

const logger = createLogger('verify-payment')

interface VerifyPaymentRequest {
  paymentIntentId: string
  deviceId: string
  planId: string
  chatId?: string
}

/**
 * Validate request body
 */
function validateRequest(body: VerifyPaymentRequest): void {
  if (!body.paymentIntentId || !body.deviceId || !body.planId) {
    throw validationError('Missing paymentIntentId, deviceId, or planId')
  }

  validatePaymentIntentId(body.paymentIntentId)
  validateUUID(body.deviceId, 'deviceId')
  validatePlanId(body.planId)

  if (body.chatId && typeof body.chatId !== 'string') {
    throw validationError('Invalid chatId format')
  }
}

serve(async (req: Request) => {
  try {
    // Load environment
    const env = loadEnvironment(['stripeSecretKey', 'supabaseUrl', 'supabaseServiceKey'])

    // Initialize clients
    const { stripe, supabase } = initializeClients(env)

    // Validate method
    validateMethod(req, ['POST'])

    // Parse request
    const body = await parseJSON<VerifyPaymentRequest>(req)
    const { paymentIntentId, deviceId, planId, chatId } = body

    logger.info('Verification request received', {
      paymentIntentId,
      deviceId: deviceId.substring(0, 8) + '...',
      planId,
      chatId: chatId ? chatId.substring(0, 8) + '...' : undefined,
    })

    // Validate input
    validateRequest(body)

    // Check if entitlement already exists
    const existingEntitlement = await findExistingEntitlement(supabase, paymentIntentId)

    if (existingEntitlement) {
      logger.info('Entitlement already exists', { entitlementId: existingEntitlement.id })
      return new Response(
        JSON.stringify({
          success: true,
          entitlementExists: true,
          entitlementId: existingEntitlement.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch payment intent from Stripe to verify it succeeded
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      logger.info('Retrieved payment intent from Stripe', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      })
    } catch (error) {
      logger.error('Failed to retrieve payment intent from Stripe', error)
      throw new Error('Failed to retrieve payment intent from Stripe')
    }

    // Verify payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      logger.warn('Payment intent status is not "succeeded"', { status: paymentIntent.status })
      return new Response(
        JSON.stringify({
          success: false,
          reason: 'Payment not succeeded',
          status: paymentIntent.status,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify metadata matches
    if (paymentIntent.metadata.planId !== planId || paymentIntent.metadata.deviceId !== deviceId) {
      logger.error('Metadata mismatch', {
        expected: { planId, deviceId },
        actual: paymentIntent.metadata,
      })
      throw validationError('Metadata mismatch')
    }

    logger.info('Payment verified - creating entitlement')

    // Calculate expiration based on plan
    const { expiresAt, remainingAnalyses } = calculatePlanExpiration(planId as PlanId)

    // Prepare entitlement data
    const entitlementData: EntitlementData = {
      device_id: deviceId,
      plan_id: planId as PlanId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer as string,
      status: 'active',
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt,
      remaining_analyses: remainingAnalyses,
    }

    // For one-time purchases, assign to specific chat if provided
    if (planId === 'one-time' && chatId) {
      entitlementData.chat_id = chatId
      logger.info('Assigning one-time purchase to chat', { chatId })
    }

    // Create entitlement
    const entitlement = await createEntitlement(supabase, entitlementData)

    logger.info('Entitlement created', { entitlementId: entitlement.id })

    return new Response(
      JSON.stringify({
        success: true,
        entitlementCreated: true,
        entitlementId: entitlement.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    logger.error('Verification failed', error)
    return createErrorResponse(error, {
      corsHeaders: { 'Content-Type': 'application/json' },
      includeCode: true,
    })
  }
})
