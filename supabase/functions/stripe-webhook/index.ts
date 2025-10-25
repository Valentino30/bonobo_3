// @ts-nocheck - Deno project with .ts imports
// Stripe Webhook Handler
// Handles payment_intent.succeeded events and creates entitlements

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

// Shared utilities
import { loadEnvironment } from '../_shared/env.ts'
import { initializeClients } from '../_shared/clients.ts'
import { createErrorResponse } from '../_shared/error-handler.ts'
import { createLogger } from '../_shared/logger.ts'
import { getSignature, parseText } from '../_shared/request.ts'
import { validatePlanId, type PlanId } from '../_shared/validation.ts'
import {
  calculatePlanExpiration,
  createEntitlement,
  findExistingEntitlement,
  type EntitlementData,
} from '../_shared/entitlement.ts'

const logger = createLogger('stripe-webhook')

/**
 * Verify webhook signature and construct event
 */
async function verifyWebhook(
  stripe: Stripe,
  body: string,
  signature: string,
  webhookSecret: string
): Promise<Stripe.Event> {
  try {
    return await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    logger.error('Webhook signature verification failed', err)
    throw new Error('Signature verification failed')
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentSuccess(
  stripe: Stripe,
  supabase: ReturnType<typeof initializeClients>['supabase'],
  paymentIntentFromEvent: Stripe.PaymentIntent
): Promise<Response> {
  logger.info('Payment intent succeeded event received', {
    id: paymentIntentFromEvent.id,
    amount: paymentIntentFromEvent.amount,
    status: paymentIntentFromEvent.status,
    customer: paymentIntentFromEvent.customer,
  })

  // CRITICAL SECURITY CHECK: Fetch the full payment intent with charges expanded
  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentFromEvent.id, {
      expand: ['charges', 'latest_charge'],
    })
    logger.info('Retrieved full payment intent', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount_received: paymentIntent.amount_received,
    })
  } catch (error) {
    logger.error('Failed to retrieve payment intent', error)
    throw new Error('Failed to retrieve payment intent')
  }

  // CRITICAL SECURITY CHECK: Verify the payment was actually succeeded
  if (paymentIntent.status !== 'succeeded') {
    logger.warn('Payment intent status is not "succeeded" - NOT creating entitlement', {
      status: paymentIntent.status,
    })
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  }

  logger.info('Payment intent status is "succeeded" - proceeding to create entitlement')

  const { planId, deviceId, userId, chatId } = paymentIntent.metadata

  if (!planId || !deviceId) {
    logger.error('Missing metadata', paymentIntent.metadata)
    throw new Error('Missing planId or deviceId in metadata')
  }

  logger.info('Payment metadata', { planId, deviceId, userId, chatId })

  // Validate plan ID
  validatePlanId(planId)

  // Check if entitlement already exists for this payment intent
  const existingEntitlement = await findExistingEntitlement(supabase, paymentIntent.id)

  if (existingEntitlement) {
    logger.info('Entitlement already exists for this payment', { paymentIntentId: paymentIntent.id })
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  }

  // Calculate expiration based on plan
  const { expiresAt, remainingAnalyses } = calculatePlanExpiration(planId as PlanId)

  // Prepare entitlement data
  // IMPORTANT: Use userId if authenticated, otherwise use deviceId
  const entitlementData: EntitlementData = {
    plan_id: planId as PlanId,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: paymentIntent.customer as string,
    status: 'active',
    purchased_at: new Date().toISOString(),
    expires_at: expiresAt,
    remaining_analyses: remainingAnalyses,
  }

  // Set user_id if authenticated, otherwise device_id
  if (userId) {
    entitlementData.user_id = userId
    logger.info('Creating entitlement for authenticated user', { userId })
  } else {
    entitlementData.device_id = deviceId
    logger.info('Creating entitlement for anonymous device', { deviceId })
  }

  // Assign chat_id for one-time purchases if provided in metadata
  if (planId === 'one-time' && chatId) {
    entitlementData.chat_id = chatId
    logger.info('Assigning one-time purchase to chat', { chatId })
  }

  // Create entitlement
  const entitlement = await createEntitlement(supabase, entitlementData)

  logger.info('Entitlement created', { entitlementId: entitlement.id })

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}

/**
 * Handle payment_intent.payment_failed event
 */
function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Response {
  logger.warn('Payment failed', {
    id: paymentIntent.id,
    status: paymentIntent.status,
    last_payment_error: paymentIntent.last_payment_error,
  })

  // Do NOT create entitlement - just log
  return new Response(JSON.stringify({ received: true }), { status: 200 })
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentCanceled(
  supabase: ReturnType<typeof initializeClients>['supabase'],
  paymentIntent: Stripe.PaymentIntent
): Promise<Response> {
  logger.warn('Payment canceled', {
    id: paymentIntent.id,
    status: paymentIntent.status,
    cancellation_reason: paymentIntent.cancellation_reason,
  })

  // Check if an entitlement was mistakenly created for this payment intent
  const existingEntitlement = await findExistingEntitlement(supabase, paymentIntent.id)

  if (existingEntitlement) {
    logger.warn('Found entitlement for canceled payment - marking as cancelled')
    await supabase
      .from('user_entitlements')
      .update({ status: 'cancelled' })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}

serve(async (req: Request) => {
  logger.info('Webhook request received', {
    method: req.method,
    timestamp: new Date().toISOString(),
  })

  try {
    // Load environment
    const env = loadEnvironment(['stripeSecretKey', 'stripeWebhookSecret', 'supabaseUrl', 'supabaseServiceKey'])

    // Initialize clients
    const { stripe, supabase } = initializeClients(env)

    // Get the signature from the headers
    const signature = getSignature(req, 'stripe-signature')

    if (!signature) {
      logger.error('No signature provided')
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    logger.info('Stripe signature found')

    // Get the raw body
    const body = await parseText(req)
    logger.debug('Request body received', { bodyLength: body.length })

    // Verify the webhook signature
    const event = await verifyWebhook(stripe, body, signature, env.stripeWebhookSecret!)

    logger.info('Webhook verified', { eventType: event.type })

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentSuccess(stripe, supabase, event.data.object as Stripe.PaymentIntent)

      case 'payment_intent.payment_failed':
        return handlePaymentFailed(event.data.object as Stripe.PaymentIntent)

      case 'payment_intent.canceled':
        return await handlePaymentCanceled(supabase, event.data.object as Stripe.PaymentIntent)

      default:
        logger.info('Unhandled event type', { eventType: event.type })
        return new Response(JSON.stringify({ received: true }), { status: 200 })
    }
  } catch (error) {
    logger.error('Webhook processing failed', error)
    return createErrorResponse(error, {
      corsHeaders: { 'Content-Type': 'application/json' },
      includeCode: true,
    })
  }
})
