import { supabase } from '@/services/supabase'

// Base currency - Always charge in EUR (EU company)
export const CHARGE_CURRENCY = 'EUR' as const
export type DisplayCurrency = 'EUR'

// Fallback prices if Stripe fetch fails
const FALLBACK_PRICES = {
  oneTime: 2.99,
  weekly: 4.99,
  monthly: 9.99,
}

interface PricingData {
  oneTime: number
  weekly: number
  monthly: number
}

/**
 * Fetches prices from Stripe via Supabase Edge Function
 * Returns live prices or fallback if fetch fails
 */
export async function fetchPricesFromStripe(): Promise<PricingData> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stripe-prices')

    if (error) {
      console.error('Failed to fetch Stripe prices, using fallback:', error)
      return FALLBACK_PRICES
    }

    if (data && typeof data === 'object') {
      const prices = {
        oneTime: data.oneTime || FALLBACK_PRICES.oneTime,
        weekly: data.weekly || FALLBACK_PRICES.weekly,
        monthly: data.monthly || FALLBACK_PRICES.monthly,
      }
      console.log('Prices fetched from Stripe (EUR):', prices)
      return prices
    }

    return FALLBACK_PRICES
  } catch (error) {
    console.error('Error fetching Stripe prices, using fallback:', error)
    return FALLBACK_PRICES
  }
}

/**
 * Gets display currency (always EUR)
 */
export function getDisplayCurrency(): DisplayCurrency {
  return 'EUR'
}

/**
 * Formats price with EUR symbol
 */
export function formatPrice(amount: number): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(amount)
  } catch {
    return `€${amount.toFixed(2)}`
  }
}
