// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  amount: number
  currency: string
  planId: string
  deviceId: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as RequestBody
    const { amount, currency, planId, deviceId } = body

    // Validate request body
    if (!amount || !currency || !planId || !deviceId) {
      throw new Error('Missing required fields: amount, currency, planId, deviceId')
    }

    if (amount < 50) {
      throw new Error('Amount must be at least 50 cents')
    }

    console.log('Creating payment intent:', { amount, currency, planId, deviceId })

    // Try to retrieve existing Stripe customer ID from previous entitlements
    const { data: existingEntitlements } = await supabase
      .from('user_entitlements')
      .select('stripe_customer_id')
      .eq('device_id', deviceId)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    let customerId = existingEntitlements?.[0]?.stripe_customer_id

    // If we found a customer ID, verify it still exists in Stripe
    if (customerId) {
      try {
        console.log('Found existing customer ID:', customerId)
        await stripe.customers.retrieve(customerId)
        console.log('✅ Customer verified in Stripe')
      } catch (error) {
        console.log('❌ Customer not found in Stripe, creating new one')
        customerId = null
      }
    }

    // Create a new customer if we don't have one
    let customer
    if (!customerId) {
      console.log('Creating new Stripe customer for device:', deviceId)
      customer = await stripe.customers.create({
        metadata: {
          deviceId,
          planId,
        },
      })
      customerId = customer.id
      console.log('✅ New customer created:', customerId)
    } else {
      // Retrieve the existing customer
      customer = await stripe.customers.retrieve(customerId)
      console.log('✅ Using existing customer:', customerId)
    }

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-11-20.acacia' }
    )

    // Create a payment intent with metadata for webhook processing
    // NOTE: Entitlement is NOT created here - it's created by the webhook handler
    // when payment_intent.succeeded event is received
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: {
        planId,
        deviceId, // Pass deviceId so webhook can create entitlement
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Enable saving payment method for future use
      setup_future_usage: 'off_session',
    })

    console.log('Payment intent created:', paymentIntent.id)
    console.log('⚠️ Entitlement will be created by webhook on payment success')

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
