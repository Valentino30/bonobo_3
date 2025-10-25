// @ts-nocheck - Deno project with .ts imports
// Supabase Edge Function to fetch product prices from Stripe
// Dynamically fetches all active products and matches them by name keywords

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Shared utilities
import { loadEnvironment } from '../_shared/env.ts'
import { initializeStripe } from '../_shared/clients.ts'
import { getCorsHeaders, handlePreFlight } from '../_shared/cors.ts'
import { createErrorResponse } from '../_shared/error-handler.ts'
import { createLogger } from '../_shared/logger.ts'

const logger = createLogger('get-stripe-prices')

interface PriceResponse {
  currency: string
  oneTime: number
  weekly: number
  monthly: number
  error?: string
}

interface PriceInfo {
  name: string
  amount: number
  currency: string
}

/**
 * Find price by matching keywords in product name
 */
function findPriceByKeywords(prices: PriceInfo[], keywords: string[]): number | undefined {
  return prices.find(p => keywords.some(k => p.name.includes(k)))?.amount
}

/**
 * Fetch all active products and their prices from Stripe
 */
async function fetchStripePrices(stripe: ReturnType<typeof initializeStripe>): Promise<PriceResponse> {
  logger.info('Fetching all active products and prices from Stripe')

  // Fetch all active products with their default prices
  const products = await stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price'],
  })

  logger.info('Active products found', { count: products.data.length })

  if (products.data.length === 0) {
    throw new Error('No active products found in Stripe')
  }

  // Extract prices and currency from all products
  const prices: PriceInfo[] = []

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

        logger.debug('Product price', { name: product.name, amount, currency })
      }
    }
  }

  // Match products by name keywords (flexible matching)
  const currency = prices[0]?.currency || 'EUR'
  const response: PriceResponse = {
    currency,
    oneTime: findPriceByKeywords(prices, ['one-time', 'one time', 'single', 'analysis']) || 2.99,
    weekly: findPriceByKeywords(prices, ['weekly', 'week', '7 day']) || 4.99,
    monthly: findPriceByKeywords(prices, ['monthly', 'month', '30 day']) || 9.99,
  }

  logger.info('Prices fetched successfully', response)

  return response
}

/**
 * Get fallback prices (used when Stripe fetch fails)
 */
function getFallbackPrices(): PriceResponse {
  return {
    currency: 'EUR',
    oneTime: 2.99,
    weekly: 4.99,
    monthly: 9.99,
    error: 'Failed to fetch prices from Stripe, using fallback',
  }
}

serve(async (req: Request) => {
  try {
    // Load environment
    const env = loadEnvironment(['stripeSecretKey'])

    // Initialize Stripe client
    const stripe = initializeStripe(env.stripeSecretKey)

    // Handle CORS
    const origin = req.headers.get('origin')
    const corsHeaders = getCorsHeaders(origin, {
      allowedOrigins: '*', // Public endpoint
      methods: ['GET', 'OPTIONS'],
    })

    // Handle preflight
    const preflight = handlePreFlight(req, corsHeaders)
    if (preflight) return preflight

    // Fetch prices from Stripe
    try {
      const prices = await fetchStripePrices(stripe)

      return new Response(JSON.stringify(prices), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (error) {
      // Log error but return fallback prices (don't fail the request)
      logger.error('Failed to fetch prices from Stripe, using fallback', error)

      const fallbackPrices = getFallbackPrices()

      return new Response(JSON.stringify(fallbackPrices), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 with fallback
      })
    }
  } catch (error) {
    logger.error('Request failed', error)
    return createErrorResponse(error, {
      corsHeaders: getCorsHeaders(req.headers.get('origin'), { allowedOrigins: '*' }),
      includeCode: true,
    })
  }
})
