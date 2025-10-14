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

    console.log('Creating payment intent:', { amount, currency, planId })

    // Create or retrieve a customer (in production, you'd want to store this)
    const customer = await stripe.customers.create({
      metadata: { planId },
    })

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-11-20.acacia' }
    )

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      metadata: { planId },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('Payment intent created:', paymentIntent.id)

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

    // Save entitlement to database
    const { data: entitlement, error: dbError } = await supabase
      .from('user_entitlements')
      .insert({
        device_id: deviceId,
        plan_id: planId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: customer.id,
        status: 'active',
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt,
        remaining_analyses: remainingAnalyses,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to save entitlement: ${dbError.message}`)
    }

    console.log('Entitlement saved to database:', entitlement?.id)

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        entitlementId: entitlement?.id,
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
