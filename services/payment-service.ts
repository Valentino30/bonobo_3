import { getDeviceId } from '@/utils/device-id'
import { fetchPricingData } from '@/services/pricing-service'

// Payment plan structure
export interface PaymentPlan {
  id: string
  name: string
  price: number
  currency: string
  description: string
  type: 'one-time' | 'subscription'
  duration?: number
}

/**
 * Get payment plans with pricing fetched from Stripe
 */
export async function getPaymentPlans(): Promise<Record<string, PaymentPlan>> {
  const pricing = await fetchPricingData()

  console.log('💰 Pricing:', pricing)

  return {
    ONE_TIME: {
      id: 'one-time',
      name: 'One-Time Analysis',
      price: pricing.oneTime,
      currency: pricing.currency,
      description: 'Unlock AI insights for one chat analysis',
      type: 'one-time' as const,
    },
    WEEKLY: {
      id: 'weekly',
      name: 'Weekly Pass',
      price: pricing.weekly,
      currency: pricing.currency,
      description: 'Unlimited AI insights for 7 days',
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      type: 'subscription' as const,
    },
    MONTHLY: {
      id: 'monthly',
      name: 'Monthly Pass',
      price: pricing.monthly,
      currency: pricing.currency,
      description: 'Unlimited AI insights for 30 days',
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      type: 'subscription' as const,
    },
  }
}

/**
 * Verify payment with Stripe via Edge Function (fallback if webhook fails)
 * The Edge Function checks if entitlement exists or creates it if needed
 */
export async function verifyPayment(paymentIntentId: string, planId: string, chatId?: string): Promise<boolean> {
  try {
    console.log('🔍 Manually verifying payment:', paymentIntentId, 'for chatId:', chatId)
    const deviceId = await getDeviceId()

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        deviceId,
        planId,
        chatId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Verify payment failed:', data.error)
      return false
    }

    if (data.success) {
      if (data.entitlementExists) {
        console.log('✅ Entitlement already exists (webhook succeeded)')
      } else if (data.entitlementCreated) {
        console.log('✅ Entitlement created manually (webhook fallback)')
      }
      return true
    }

    console.log('⚠️ Payment verification failed:', data.reason)
    return false
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    return false
  }
}
