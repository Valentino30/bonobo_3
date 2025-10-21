// Verify Payment and Create Entitlement
// Fallback endpoint to manually verify payment and create entitlement if webhook failed

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

// Initialize Supabase client
// @ts-ignore: Deno global
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// @ts-ignore: Deno global
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VerifyPaymentRequest {
  paymentIntentId: string
  deviceId: string
  planId: string
  chatId?: string
}

serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    console.log('🔍 Verify payment request received')

    const { paymentIntentId, deviceId, planId, chatId }: VerifyPaymentRequest = await req.json()

    if (!paymentIntentId || !deviceId || !planId) {
      console.error('❌ Missing required parameters')
      return new Response(JSON.stringify({ error: 'Missing paymentIntentId, deviceId, or planId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('📝 Verifying payment:', {
      paymentIntentId,
      deviceId,
      planId,
      chatId,
    })

    // Check if entitlement already exists
    const { data: existingEntitlement } = await supabase
      .from('user_entitlements')
      .select('id, status')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (existingEntitlement) {
      console.log('✅ Entitlement already exists:', existingEntitlement.id)
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
    let paymentIntent: Stripe.PaymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      console.log('✅ Retrieved payment intent from Stripe:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      })
    } catch (error) {
      console.error('❌ Failed to retrieve payment intent from Stripe:', error)
      return new Response(JSON.stringify({ error: 'Failed to retrieve payment intent from Stripe' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      console.log('⚠️ Payment intent status is not "succeeded":', paymentIntent.status)
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
      console.error('❌ Metadata mismatch:', {
        expected: { planId, deviceId },
        actual: paymentIntent.metadata,
      })
      return new Response(JSON.stringify({ error: 'Metadata mismatch' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Payment verified - creating entitlement')

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

    // Create entitlement
    const insertData: any = {
      device_id: deviceId,
      plan_id: planId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer as string,
      status: 'active',
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt,
      remaining_analyses: remainingAnalyses,
    }

    // For one-time purchases, assign to specific chat if provided
    if (planId === 'one-time' && chatId) {
      insertData.chat_id = chatId
      console.log('✅ Assigning one-time purchase to chat:', chatId)
    }

    const { data: entitlement, error: dbError } = await supabase
      .from('user_entitlements')
      .insert(insertData)
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return new Response(JSON.stringify({ error: `Failed to create entitlement: ${dbError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Entitlement created:', entitlement.id)

    return new Response(
      JSON.stringify({
        success: true,
        entitlementCreated: true,
        entitlementId: entitlement.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Verify payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Verification failed'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
