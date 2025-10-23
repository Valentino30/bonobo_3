import { supabase } from '@/services/supabase'

// Fallback pricing if Stripe fetch fails
const FALLBACK_PRICING = {
  currency: 'EUR',
  oneTime: 2.99,
  weekly: 4.99,
  monthly: 9.99,
}

export interface PricingData {
  currency: string
  oneTime: number
  weekly: number
  monthly: number
}

/**
 * Fetches prices and currency from Stripe
 * Falls back to hardcoded EUR pricing if fetch fails
 */
export async function fetchPricesFromStripe(): Promise<PricingData> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stripe-prices')

    if (error) {
      console.error('Failed to fetch Stripe prices, using fallback:', error)
      return FALLBACK_PRICING
    }

    if (data && typeof data === 'object') {
      const pricing: PricingData = {
        currency: data.currency || FALLBACK_PRICING.currency,
        oneTime: data.oneTime || FALLBACK_PRICING.oneTime,
        weekly: data.weekly || FALLBACK_PRICING.weekly,
        monthly: data.monthly || FALLBACK_PRICING.monthly,
      }
      console.log('Pricing fetched from Stripe:', pricing)
      return pricing
    }

    return FALLBACK_PRICING
  } catch (error) {
    console.error('Error fetching Stripe prices, using fallback:', error)
    return FALLBACK_PRICING
  }
}
