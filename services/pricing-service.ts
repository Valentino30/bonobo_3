import { supabase } from '@/supabase/client'

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
 * Fetches pricing data (currency and prices for all plans) from Stripe
 * Falls back to hardcoded EUR pricing if fetch fails
 */
export async function fetchPricingData(): Promise<PricingData> {
  try {
    console.log('🔄 Fetching pricing from Stripe Edge Function...')
    const { data, error } = await supabase.functions.invoke('get-stripe-prices')

    if (error) {
      console.error('❌ Stripe Edge Function error:', {
        name: error.name,
        message: error.message,
        context: error.context,
      })
      console.log('📋 Using fallback pricing')
      return FALLBACK_PRICING
    }

    console.log('✅ Edge Function response:', data)

    if (data && typeof data === 'object') {
      const pricing: PricingData = {
        currency: data.currency || FALLBACK_PRICING.currency,
        oneTime: data.oneTime || FALLBACK_PRICING.oneTime,
        weekly: data.weekly || FALLBACK_PRICING.weekly,
        monthly: data.monthly || FALLBACK_PRICING.monthly,
      }
      console.log('💰 Pricing fetched from Stripe successfully:', pricing)
      return pricing
    }

    console.warn('⚠️ Invalid data format from Edge Function, using fallback')
    return FALLBACK_PRICING
  } catch (error) {
    console.error('❌ Exception fetching Stripe prices:', error)
    console.log('📋 Using fallback pricing')
    return FALLBACK_PRICING
  }
}
