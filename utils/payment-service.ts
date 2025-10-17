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
export function getPaymentPlans(): Record<string, PaymentPlan> {
  const currency = CurrencyService.getUserCurrency()
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

// Dynamic payment plans based on user's currency
export const PAYMENT_PLANS = getPaymentPlans()

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

      console.log('Checking access for device:', deviceId, 'user:', user?.id, 'chatId:', chatId)

      let query = supabase
        .from('user_entitlements')
        .select('*')
        .eq('status', 'active')

      // If user is authenticated, check by user_id OR device_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.or(`user_id.eq.${user.id},device_id.eq.${deviceId}`)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { data: entitlements, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error checking access:', error)
        console.error('Error details:', JSON.stringify(error))
        return false
      }

      console.log('Found entitlements:', entitlements?.length ?? 0)
      
      if (!entitlements || entitlements.length === 0) {
        console.log('❌ No entitlements found')
        return false
      }

      // Check each entitlement
      for (const entitlement of entitlements) {
        console.log('Checking entitlement:', {
          id: entitlement.id,
          plan_id: entitlement.plan_id,
          chat_id: entitlement.chat_id,
          status: entitlement.status,
          expires_at: entitlement.expires_at
        })
        
        // Check one-time purchase
        if (entitlement.plan_id === 'one-time') {
          // If chatId is provided, check if this one-time purchase is for this chat
          if (chatId) {
            // If chat_id is null (not yet used), user has access
            // If chat_id matches, user has access
            // If chat_id doesn't match, user doesn't have access
            if (entitlement.chat_id === null || entitlement.chat_id === chatId) {
              console.log('✅ Access granted for one-time purchase')
              return true
            } else {
              console.log('❌ One-time purchase used for different chat:', entitlement.chat_id)
            }
          } else {
            // No chatId provided, just check if there's an unused one
            if (entitlement.chat_id === null) {
              console.log('✅ Access granted - unused one-time purchase')
              return true
            }
          }
        }

        // Check time-based subscriptions
        if (entitlement.expires_at) {
          const expiryDate = new Date(entitlement.expires_at)
          if (new Date() < expiryDate) {
            return true
          } else {
            // Mark as expired
            await supabase
              .from('user_entitlements')
              .update({ status: 'expired' })
              .eq('id', entitlement.id)
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking access (catch):', error)
      return false
    }
  }

  // Assign one-time purchase to a specific chat
  static async assignAnalysisToChat(chatId: string): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('user_entitlements')
        .select('*')
        .eq('plan_id', 'one-time')
        .eq('status', 'active')
        .is('chat_id', null)

      // If user is authenticated, check by user_id OR device_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.or(`user_id.eq.${user.id},device_id.eq.${deviceId}`)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { data: entitlements, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)

      if (error || !entitlements || entitlements.length === 0) {
        console.log('No unassigned one-time entitlement found (might have subscription)')
        return
      }

      const entitlement = entitlements[0]

      // Assign this entitlement to the chat
      const { error: updateError } = await supabase
        .from('user_entitlements')
        .update({
          chat_id: chatId,
        })
        .eq('id', entitlement.id)

      if (updateError) {
        console.error('Error assigning chat to entitlement:', updateError)
      } else {
        console.log('✅ Entitlement assigned to chat:', chatId)
      }
    } catch (error) {
      console.error('Error using analysis:', error)
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

      // If user is authenticated, check by user_id OR device_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.or(`user_id.eq.${user.id},device_id.eq.${deviceId}`)
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

      // If user is authenticated, check by user_id OR device_id
      // Otherwise, check by device_id only
      if (user) {
        query = query.or(`user_id.eq.${user.id},device_id.eq.${deviceId}`)
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

  // Get plan details by ID
  static getPlanDetails(planId: string): typeof PAYMENT_PLANS[keyof typeof PAYMENT_PLANS] | null {
    const plan = Object.values(PAYMENT_PLANS).find((p) => p.id === planId)
    return plan || null
  }

  // Legacy method - no longer needed but kept for backward compatibility
  static async grantAccess(planId: string): Promise<void> {
    // This is now handled by the Edge Function
    console.log('⚠️ grantAccess() is deprecated - entitlement is created by Edge Function')
  }
}

