import { supabase } from '@/services/supabase'

// Base currency - Always charge in EUR (EU company)
export const CHARGE_CURRENCY = 'EUR' as const
export type DisplayCurrency = 'EUR'

// Base pricing in EUR (fetched from Stripe, with fallback values)
let BASE_PRICING_EUR = {
  oneTime: 2.99,
  weekly: 4.99,
  monthly: 9.99,
}

/**
 * Fetches base prices from Stripe via Supabase Edge Function
 */
export async function fetchBasePricesFromStripe(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stripe-prices')

    if (error) {
      console.error('Failed to fetch Stripe prices:', error)
      return
    }

    if (data && typeof data === 'object') {
      if (data.oneTime) BASE_PRICING_EUR.oneTime = data.oneTime
      if (data.weekly) BASE_PRICING_EUR.weekly = data.weekly
      if (data.monthly) BASE_PRICING_EUR.monthly = data.monthly

      console.log('Base prices updated from Stripe (EUR):', BASE_PRICING_EUR)
    }
  } catch (error) {
    console.error('Error fetching base prices from Stripe:', error)
  }
}

/**
 * Gets display currency (always EUR)
 */
export function getDisplayCurrency(): DisplayCurrency {
  return 'EUR'
}

/**
 * Gets display price (same as charge price since we only use EUR)
 */
export function getDisplayPrice(planType: 'oneTime' | 'weekly' | 'monthly'): number {
  return BASE_PRICING_EUR[planType]
}

/**
 * Gets the actual EUR price that will be charged
 */
export function getChargePrice(planType: 'oneTime' | 'weekly' | 'monthly'): { amount: number; currency: string } {
  return {
    amount: BASE_PRICING_EUR[planType],
    currency: CHARGE_CURRENCY,
  }
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
