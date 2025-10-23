// Supabase Edge Function to fetch product prices from Stripe
// This ensures pricing is fetched from the single source of truth (Stripe)
// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

// @ts-ignore: Deno global
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Product IDs for your payment plans
// @ts-ignore: Deno global
const PRODUCT_IDS = {
  // @ts-ignore: Deno global
  ONE_TIME: Deno.env.get('STRIPE_PRODUCT_ONE_TIME') || '',
  // @ts-ignore: Deno global
  WEEKLY: Deno.env.get('STRIPE_PRODUCT_WEEKLY') || '',
  // @ts-ignore: Deno global
  MONTHLY: Deno.env.get('STRIPE_PRODUCT_MONTHLY') || '',
}

interface PriceResponse {
  currency: string
  oneTime: number
  weekly: number
  monthly: number
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching prices from Stripe...')

    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    })

    // Map prices by product ID and extract currency
    const priceMap: Record<string, number> = {}
    let currency = 'EUR' // Default fallback

    for (const price of prices.data) {
      if (price.product && price.unit_amount) {
        const productId = typeof price.product === 'string' ? price.product : price.product.id
        // Convert from cents to base currency unit
        priceMap[productId] = price.unit_amount / 100
        // Use currency from first valid price
        if (price.currency && !currency) {
          currency = price.currency.toUpperCase()
        }
      }
    }

    // Build response with prices and currency from Stripe
    const response: PriceResponse = {
      currency,
      oneTime: priceMap[PRODUCT_IDS.ONE_TIME] || 2.99,
      weekly: priceMap[PRODUCT_IDS.WEEKLY] || 4.99,
      monthly: priceMap[PRODUCT_IDS.MONTHLY] || 9.99,
    }

    console.log('Prices fetched successfully:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching prices:', error)

    // Return fallback prices on error
    return new Response(
      JSON.stringify({
        currency: 'EUR',
        oneTime: 2.99,
        weekly: 4.99,
        monthly: 9.99,
        error: 'Failed to fetch prices from Stripe, using fallback',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 with fallback
      }
    )
  }
})
