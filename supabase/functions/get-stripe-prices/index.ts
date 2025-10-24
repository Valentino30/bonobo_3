// Supabase Edge Function to fetch product prices from Stripe
// Dynamically fetches all active products and matches them by metadata.plan_id
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
    console.log('🔄 Fetching all active products and prices from Stripe...')

    // Fetch all active products with their default prices
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    })

    console.log(`📦 Found ${products.data.length} active products`)

    if (products.data.length === 0) {
      throw new Error('No active products found in Stripe')
    }

    // Extract prices and currency from all products
    const prices: Array<{ name: string; amount: number; currency: string }> = []

    for (const product of products.data) {
      if (product.default_price) {
        const priceObj = typeof product.default_price === 'string'
          ? await stripe.prices.retrieve(product.default_price)
          : product.default_price

        if (priceObj.unit_amount) {
          const amount = priceObj.unit_amount / 100 // Convert cents to base unit
          const currency = priceObj.currency.toUpperCase()

          prices.push({
            name: product.name.toLowerCase(),
            amount,
            currency,
          })

          console.log(`💰 ${product.name}: ${currency} ${amount}`)
        }
      }
    }

    // Match products by name (flexible matching)
    const findPrice = (keywords: string[]) => {
      return prices.find(p => keywords.some(k => p.name.includes(k)))?.amount
    }

    const currency = prices[0]?.currency || 'EUR'

    const response: PriceResponse = {
      currency,
      oneTime: findPrice(['one-time', 'one time', 'single', 'analysis']) || 2.99,
      weekly: findPrice(['weekly', 'week', '7 day']) || 4.99,
      monthly: findPrice(['monthly', 'month', '30 day']) || 9.99,
    }

    console.log('✅ Prices fetched successfully:', response)

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
