import { getDeviceId } from './device-id'
import { supabase } from './supabase'
import { CurrencyService, type SupportedCurrency } from './currency-service'

// Payment plan structure
export interface PaymentPlan {
  id: string
  name: string
  price: number
  currency: SupportedCurrency
  description: string
  type: 'one-time' | 'subscription'
  duration?: number
}

/**
 * Get payment plans with pricing in user's currency
 */
export async function getPaymentPlans(): Promise<Record<string, PaymentPlan>> {
  // Update pricing with live exchange rates
  await CurrencyService.updatePricingWithLiveRates()

  // Check for manual currency override first
  const override = await CurrencyService.getCurrencyOverride()
  const currency = override || CurrencyService.getUserCurrency()
  const pricing = CurrencyService.getPricing(currency)

  console.log('💰 Payment plans currency:', currency, 'Pricing:', pricing)

  return {
    ONE_TIME: {
      id: 'one-time',
      name: 'One-Time Analysis',
      price: pricing.oneTime,
      currency,
      description: 'Unlock AI insights for one chat analysis',
      type: 'one-time' as const,
    },
    WEEKLY: {
      id: 'weekly',
      name: 'Weekly Pass',
      price: pricing.weekly,
      currency,
      description: 'Unlimited AI insights for 7 days',
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      type: 'subscription' as const,
    },
    MONTHLY: {
      id: 'monthly',
      name: 'Monthly Pass',
      price: pricing.monthly,
      currency,
      description: 'Unlimited AI insights for 30 days',
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      type: 'subscription' as const,
    },
  }
}

interface UserEntitlement {
  id: string
  plan: string
  purchaseDate: Date
  expiryDate?: Date
  remainingAnalyses?: number
  status: string
}

export class PaymentService {
  // Check if user has access to AI insights for a specific chat
  static async hasAccess(chatId?: string): Promise<boolean> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      console.log('🔐 Checking access for device:', deviceId, 'user:', user?.id, 'chatId:', chatId)

      let query = supabase
        .from('user_entitlements')
        .select('*')
        .eq('status', 'active')
        // CRITICAL: Only consider entitlements with valid Stripe payment
        .not('stripe_payment_intent_id', 'is', null)

      // If user is authenticated, ONLY check by user_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { data: entitlements, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error checking access:', error)
        console.error('Error details:', JSON.stringify(error))
        return false
      }

      console.log(`📋 Found ${entitlements?.length ?? 0} valid entitlements (with payment confirmation)`)

      if (!entitlements || entitlements.length === 0) {
        console.log('❌ No valid entitlements found')
        return false
      }

      // Check each entitlement
      for (const entitlement of entitlements) {
        console.log('🔍 Checking entitlement:', {
          id: entitlement.id,
          plan_id: entitlement.plan_id,
          chat_id: entitlement.chat_id,
          status: entitlement.status,
          expires_at: entitlement.expires_at,
          stripe_payment_intent_id: entitlement.stripe_payment_intent_id,
        })

        // Check one-time purchase
        if (entitlement.plan_id === 'one-time') {
          // CRITICAL: One-time purchases must be checked with chatId
          if (!chatId) {
            console.log('⚠️ No chatId provided for one-time purchase check')
            continue
          }

          // One-time purchase is valid ONLY if:
          // 1. It's assigned to THIS specific chat (chat_id === chatId)
          // 2. OR it's unassigned (chat_id === null) - available to be assigned to this chat
          if (entitlement.chat_id === chatId) {
            console.log('✅ Access granted: One-time purchase assigned to this chat')
            return true
          } else if (entitlement.chat_id === null) {
            console.log('✅ Access granted: Unused one-time purchase available')
            return true
          } else {
            console.log(`❌ One-time purchase already used for different chat: ${entitlement.chat_id}`)
            // Continue checking other entitlements
          }
        }

        // Check time-based subscriptions (weekly, monthly)
        if (entitlement.plan_id === 'weekly' || entitlement.plan_id === 'monthly') {
          if (!entitlement.expires_at) {
            console.error('⚠️ Subscription missing expiry date:', entitlement.id)
            continue
          }

          const expiryDate = new Date(entitlement.expires_at)
          const now = new Date()

          if (now < expiryDate) {
            console.log(`✅ Access granted: Active ${entitlement.plan_id} subscription (expires ${expiryDate.toISOString()})`)
            return true
          } else {
            console.log(`❌ Subscription expired at ${expiryDate.toISOString()}`)
            // Mark as expired
            await supabase
              .from('user_entitlements')
              .update({ status: 'expired' })
              .eq('id', entitlement.id)
          }
        }
      }

      console.log('❌ No valid access found')
      return false
    } catch (error) {
      console.error('❌ Error checking access (exception):', error)
      return false
    }
  }

  // Assign one-time purchase to a specific chat
  static async assignAnalysisToChat(chatId: string): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      console.log('🔗 Attempting to assign one-time entitlement to chat:', chatId)

      let query = supabase
        .from('user_entitlements')
        .select('*')
        .eq('plan_id', 'one-time')
        .eq('status', 'active')
        .is('chat_id', null)
        // CRITICAL: Only assign entitlements with valid Stripe payment
        .not('stripe_payment_intent_id', 'is', null)

      // If user is authenticated, ONLY check by user_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { data: entitlements, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ Error fetching entitlements:', error)
        return
      }

      if (!entitlements || entitlements.length === 0) {
        console.log('ℹ️ No unassigned one-time entitlement found (user might have subscription)')
        return
      }

      const entitlement = entitlements[0]
      console.log('✅ Found unassigned entitlement:', entitlement.id)

      // CRITICAL SECURITY: Double-check that this entitlement has a valid payment
      if (!entitlement.stripe_payment_intent_id) {
        console.error('❌ SECURITY VIOLATION: Attempting to assign entitlement without payment!')
        console.error('Entitlement ID:', entitlement.id)
        throw new Error('Cannot assign entitlement without valid payment')
      }

      // Assign this entitlement to the chat
      const { error: updateError } = await supabase
        .from('user_entitlements')
        .update({
          chat_id: chatId,
        })
        .eq('id', entitlement.id)

      if (updateError) {
        console.error('❌ Error assigning chat to entitlement:', updateError)
        throw updateError
      } else {
        console.log('✅ Entitlement assigned to chat:', chatId)
        console.log('Entitlement details:', {
          id: entitlement.id,
          stripe_payment_intent_id: entitlement.stripe_payment_intent_id,
          chat_id: chatId,
        })
      }
    } catch (error) {
      console.error('❌ Error in assignAnalysisToChat:', error)
      throw error
    }
  }

  // Check if user has an active subscription (not one-time)
  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('user_entitlements')
        .select('*')
        .eq('status', 'active')
        .neq('plan_id', 'one-time')

      // If user is authenticated, ONLY check by user_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { data: entitlements, error } = await query

      if (error) {
        console.error('Error checking subscription:', error)
        return false
      }

      // Check if any subscription is still valid
      for (const entitlement of entitlements || []) {
        if (entitlement.expires_at) {
          const expiryDate = new Date(entitlement.expires_at)
          if (new Date() < expiryDate) {
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking subscription:', error)
      return false
    }
  }

  // Get current entitlement info
  static async getEntitlement(): Promise<UserEntitlement | null> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('user_entitlements')
        .select('*')
        .eq('status', 'active')

      // If user is authenticated, ONLY check by user_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { data: entitlements, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)

      if (error || !entitlements || entitlements.length === 0) {
        return null
      }

      const ent = entitlements[0]
      return {
        id: ent.id,
        plan: ent.plan_id,
        purchaseDate: new Date(ent.purchased_at),
        expiryDate: ent.expires_at ? new Date(ent.expires_at) : undefined,
        remainingAnalyses: ent.remaining_analyses,
        status: ent.status,
      }
    } catch (error) {
      console.error('Error getting entitlement:', error)
      return null
    }
  }

  // Clear entitlement (for testing - marks all as cancelled)
  static async clearEntitlement(): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      const { error } = await supabase
        .from('user_entitlements')
        .update({ status: 'cancelled' })
        .eq('device_id', deviceId)
        .eq('status', 'active')

      if (error) {
        console.error('Error clearing entitlement:', error)
      } else {
        console.log('🗑️ Entitlements cleared')
      }
    } catch (error) {
      console.error('Error clearing entitlement:', error)
    }
  }

  // Delete all invalid entitlements (for testing - removes entitlements without payment)
  static async deleteInvalidEntitlements(): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      console.log('🔍 Searching for invalid entitlements (without stripe_payment_intent_id)...')

      // Find all entitlements without stripe_payment_intent_id
      const { data: invalidEntitlements, error: fetchError } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('device_id', deviceId)
        .is('stripe_payment_intent_id', null)

      if (fetchError) {
        console.error('❌ Error fetching invalid entitlements:', fetchError)
        return
      }

      console.log(`Found ${invalidEntitlements?.length ?? 0} invalid entitlements`)

      if (!invalidEntitlements || invalidEntitlements.length === 0) {
        console.log('✅ No invalid entitlements found')
        return
      }

      // Log each invalid entitlement
      invalidEntitlements.forEach((ent) => {
        console.log('⚠️ Invalid entitlement:', {
          id: ent.id,
          plan_id: ent.plan_id,
          status: ent.status,
          created_at: ent.created_at,
          stripe_payment_intent_id: ent.stripe_payment_intent_id,
        })
      })

      // Delete them
      const { error: deleteError } = await supabase
        .from('user_entitlements')
        .delete()
        .eq('device_id', deviceId)
        .is('stripe_payment_intent_id', null)

      if (deleteError) {
        console.error('❌ Error deleting invalid entitlements:', deleteError)
      } else {
        console.log(`✅ Deleted ${invalidEntitlements.length} invalid entitlements`)
      }
    } catch (error) {
      console.error('❌ Error in deleteInvalidEntitlements:', error)
    }
  }

  // Reset entitlements for testing - reactivates 'used' entitlements
  static async resetEntitlementsForTesting(): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      const { error } = await supabase
        .from('user_entitlements')
        .update({
          status: 'active',
          chat_id: null,
        })
        .eq('device_id', deviceId)
        .in('status', ['used', 'cancelled'])

      if (error) {
        console.error('Error resetting entitlements:', error)
      } else {
        console.log('🔄 Entitlements reset to active')
      }
    } catch (error) {
      console.error('Error resetting entitlements:', error)
    }
  }

  // Debug: List all entitlements for this device
  static async debugListAllEntitlements(): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔍 DEBUG: All Entitlements for Device:', deviceId)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      const { data: allEntitlements, error } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching entitlements:', error)
        return
      }

      if (!allEntitlements || allEntitlements.length === 0) {
        console.log('📭 No entitlements found')
        return
      }

      console.log(`\n📊 Total entitlements: ${allEntitlements.length}\n`)

      allEntitlements.forEach((ent, index) => {
        const isValid = ent.stripe_payment_intent_id !== null
        const icon = isValid ? '✅' : '❌'

        console.log(`${icon} Entitlement #${index + 1}:`)
        console.log(`   ID: ${ent.id}`)
        console.log(`   Plan: ${ent.plan_id}`)
        console.log(`   Status: ${ent.status}`)
        console.log(`   Chat ID: ${ent.chat_id ?? 'null (unassigned)'}`)
        console.log(`   Stripe Payment Intent: ${ent.stripe_payment_intent_id ?? 'NULL (INVALID!)'}`)
        console.log(`   Stripe Customer: ${ent.stripe_customer_id ?? 'null'}`)
        console.log(`   Created: ${ent.created_at}`)
        console.log(`   Purchased: ${ent.purchased_at ?? 'null'}`)
        console.log(`   Expires: ${ent.expires_at ?? 'null'}`)
        console.log(`   Valid: ${isValid ? 'YES ✅' : 'NO ❌ (MISSING PAYMENT)'}`)
        console.log('')
      })

      const validCount = allEntitlements.filter((e) => e.stripe_payment_intent_id !== null).length
      const invalidCount = allEntitlements.length - validCount

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📈 Summary:`)
      console.log(`   Valid entitlements: ${validCount}`)
      console.log(`   Invalid entitlements: ${invalidCount}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    } catch (error) {
      console.error('❌ Error in debugListAllEntitlements:', error)
    }
  }

  // Get plan details by ID
  static async getPlanDetails(planId: string): Promise<PaymentPlan | null> {
    const PAYMENT_PLANS = await getPaymentPlans()
    const plan = Object.values(PAYMENT_PLANS).find((p) => p.id === planId)
    return plan || null
  }

  // Legacy method - no longer needed but kept for backward compatibility
  static async grantAccess(planId: string): Promise<void> {
    // This is now handled by the Edge Function
    console.log('⚠️ grantAccess() is deprecated - entitlement is created by Edge Function')
  }

  /**
   * Manually verify payment and create entitlement (fallback if webhook fails)
   * @param paymentIntentId - The Stripe payment intent ID
   * @param planId - The plan ID (one-time, weekly, monthly)
   * @param chatId - Optional chat ID for one-time purchases
   */
  static async verifyPayment(paymentIntentId: string, planId: string, chatId?: string): Promise<boolean> {
    try {
      console.log('🔍 Manually verifying payment:', paymentIntentId, 'for chatId:', chatId)
      const deviceId = await getDeviceId()

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

      const response = await fetch(
        `${supabaseUrl}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            paymentIntentId,
            deviceId,
            planId,
            chatId,
          }),
        }
      )

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
}

