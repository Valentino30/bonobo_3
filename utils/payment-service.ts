import { supabase } from './supabase'
import { getDeviceId } from './device-id'

// Payment plans
export const PAYMENT_PLANS = {
  ONE_TIME: {
    id: 'one-time',
    name: 'One-Time Analysis',
    price: 2.99,
    currency: 'USD',
    description: 'Unlock AI insights for one chat analysis',
    type: 'one-time' as const,
  },
  WEEKLY: {
    id: 'weekly',
    name: 'Weekly Pass',
    price: 4.99,
    currency: 'USD',
    description: 'Unlimited AI insights for 7 days',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    type: 'subscription' as const,
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Pass',
    price: 9.99,
    currency: 'USD',
    description: 'Unlimited AI insights for 30 days',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    type: 'subscription' as const,
  },
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
  // Check if user has access to AI insights
  static async hasAccess(): Promise<boolean> {
    try {
      const deviceId = await getDeviceId()
      
      // Query active entitlements for this device
      const { data: entitlements, error } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('device_id', deviceId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error checking access:', error)
        return false
      }

      if (!entitlements || entitlements.length === 0) {
        return false
      }

      // Check each entitlement
      for (const entitlement of entitlements) {
        // Check one-time purchase
        if (entitlement.plan_id === 'one-time') {
          if ((entitlement.remaining_analyses ?? 0) > 0) {
            return true
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
      console.error('Error checking access:', error)
      return false
    }
  }

  // Use one analysis (for one-time purchase)
  static async useAnalysis(): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get active one-time purchase
      const { data: entitlements, error } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('device_id', deviceId)
        .eq('plan_id', 'one-time')
        .eq('status', 'active')
        .gt('remaining_analyses', 0)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error || !entitlements || entitlements.length === 0) {
        console.error('No active one-time entitlement found')
        return
      }

      const entitlement = entitlements[0]
      const newRemaining = (entitlement.remaining_analyses ?? 0) - 1

      // Update remaining analyses
      const { error: updateError } = await supabase
        .from('user_entitlements')
        .update({ 
          remaining_analyses: newRemaining,
          status: newRemaining <= 0 ? 'used' : 'active'
        })
        .eq('id', entitlement.id)

      if (updateError) {
        console.error('Error updating remaining analyses:', updateError)
      } else {
        console.log('✅ Analysis used, remaining:', newRemaining)
      }
    } catch (error) {
      console.error('Error using analysis:', error)
    }
  }

  // Get current entitlement info
  static async getEntitlement(): Promise<UserEntitlement | null> {
    try {
      const deviceId = await getDeviceId()

      const { data: entitlements, error } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('device_id', deviceId)
        .eq('status', 'active')
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

