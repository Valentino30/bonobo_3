// Stripe Webhook Handler
// Handles payment_intent.succeeded events and creates entitlements

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
// @ts-ignore: Deno-specific imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// @ts-ignore: Deno global
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

// @ts-ignore: Deno global
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Initialize Supabase client
// @ts-ignore: Deno global
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// @ts-ignore: Deno global
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: Request) => {
  // Log EVERY request that arrives
  console.log('🔔 Webhook request received at:', new Date().toISOString())
  console.log('📥 Request method:', req.method)
  console.log('📥 Request headers:', Object.fromEntries(req.headers.entries()))

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ No signature provided')
      console.error('❌ Headers received:', Object.fromEntries(req.headers.entries()))
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
      })
    }

    console.log('✅ Stripe signature found:', signature.substring(0, 20) + '...')
    console.log('🔑 Using webhook secret starting with:', webhookSecret.substring(0, 10) + '...')

    // Get the raw body
    const body = await req.text()
    console.log('📦 Body length:', body.length)

    // Verify the webhook signature (use async version for Deno)
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      console.error('Error details:', err instanceof Error ? err.message : String(err))
      return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
        status: 400,
      })
    }

    console.log('✅ Webhook verified:', event.type)

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntentFromEvent = event.data.object as Stripe.PaymentIntent

      console.log('💰 Payment intent succeeded event received:', {
        id: paymentIntentFromEvent.id,
        amount: paymentIntentFromEvent.amount,
        status: paymentIntentFromEvent.status,
        customer: paymentIntentFromEvent.customer,
        metadata: paymentIntentFromEvent.metadata,
      })

      // CRITICAL SECURITY CHECK: Fetch the full payment intent with charges expanded
      // This ensures we verify the actual charge status
      let paymentIntent: Stripe.PaymentIntent
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentFromEvent.id, {
          expand: ['charges', 'latest_charge'],
        })
        console.log('✅ Retrieved full payment intent')
        console.log('Full payment intent details:', {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          amount_received: paymentIntent.amount_received,
          confirmation_method: paymentIntent.confirmation_method,
          capture_method: paymentIntent.capture_method,
          latest_charge: paymentIntent.latest_charge,
        })
      } catch (error) {
        console.error('❌ Failed to retrieve payment intent:', error)
        return new Response(JSON.stringify({ error: 'Failed to retrieve payment intent' }), {
          status: 500,
        })
      }

      // CRITICAL SECURITY CHECK: Verify the payment was actually succeeded
      if (paymentIntent.status !== 'succeeded') {
        console.log('⚠️ Payment intent status is not "succeeded":', paymentIntent.status)
        console.log('⚠️ NOT creating entitlement for non-succeeded payment')
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }

      console.log('✅ Payment intent status is "succeeded" - proceeding to create entitlement')

      const { planId, deviceId } = paymentIntent.metadata

      if (!planId || !deviceId) {
        console.error('❌ Missing metadata:', paymentIntent.metadata)
        return new Response(
          JSON.stringify({ error: 'Missing planId or deviceId in metadata' }),
          { status: 400 }
        )
      }

      // Calculate expiration date based on plan
      let expiresAt = null
      let remainingAnalyses = 0

      if (planId === 'one-time') {
        remainingAnalyses = 1
      } else if (planId === 'weekly') {
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        expiresAt = weekFromNow.toISOString()
      } else if (planId === 'monthly') {
        const monthFromNow = new Date()
        monthFromNow.setMonth(monthFromNow.getMonth() + 1)
        expiresAt = monthFromNow.toISOString()
      }

      // Check if entitlement already exists for this payment intent
      const { data: existingEntitlement } = await supabase
        .from('user_entitlements')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single()

      if (existingEntitlement) {
        console.log('ℹ️ Entitlement already exists for this payment:', paymentIntent.id)
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }

      // Save entitlement to database
      const { data: entitlement, error: dbError } = await supabase
        .from('user_entitlements')
        .insert({
          device_id: deviceId,
          plan_id: planId,
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
          status: 'active',
          purchased_at: new Date().toISOString(),
          expires_at: expiresAt,
          remaining_analyses: remainingAnalyses,
        })
        .select()
        .single()

      if (dbError) {
        console.error('❌ Database error:', dbError)
        return new Response(
          JSON.stringify({ error: `Failed to save entitlement: ${dbError.message}` }),
          { status: 500 }
        )
      }

      console.log('✅ Entitlement created:', entitlement?.id)

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
      })
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('❌ Payment failed:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        last_payment_error: paymentIntent.last_payment_error,
      })

      // Do NOT create entitlement - just log
      return new Response(JSON.stringify({ received: true }), { status: 200 })
    }

    // Handle payment_intent.canceled
    if (event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('🚫 Payment canceled:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        cancellation_reason: paymentIntent.cancellation_reason,
      })

      // Check if an entitlement was mistakenly created for this payment intent
      const { data: existingEntitlement } = await supabase
        .from('user_entitlements')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single()

      if (existingEntitlement) {
        console.log('⚠️ Found entitlement for canceled payment - marking as cancelled')
        await supabase
          .from('user_entitlements')
          .update({ status: 'cancelled' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 })
    }

    // Handle other event types if needed
    console.log(`ℹ️ Unhandled event type: ${event.type}`)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    })
  }
})
