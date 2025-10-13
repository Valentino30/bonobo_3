import * as SecureStore from 'expo-secure-store'

// Payment plans
export const PAYMENT_PLANS = {
  ONE_TIME: {
    id: 'one_time_analysis',
    name: 'One-Time Analysis',
    price: 2.99,
    currency: 'USD',
    description: 'Unlock AI insights for one chat analysis',
    type: 'one-time' as const,
  },
  WEEKLY: {
    id: 'weekly_pass',
    name: 'Weekly Pass',
    price: 4.99,
    currency: 'USD',
    description: 'Unlimited AI insights for 7 days',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    type: 'subscription' as const,
  },
  MONTHLY: {
    id: 'monthly_pass',
    name: 'Monthly Pass',
    price: 9.99,
    currency: 'USD',
    description: 'Unlimited AI insights for 30 days',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    type: 'subscription' as const,
  },
}

interface UserEntitlement {
  plan: string
  purchaseDate: Date
  expiryDate?: Date
  remainingAnalyses?: number
}

const ENTITLEMENT_KEY = 'bonobo_user_entitlement'

export class PaymentService {
  // Check if user has access to AI insights
  static async hasAccess(): Promise<boolean> {
    try {
      const entitlementJson = await SecureStore.getItemAsync(ENTITLEMENT_KEY)
      if (!entitlementJson) return false

      const entitlement: UserEntitlement = JSON.parse(entitlementJson)

      // Check one-time purchase
      if (entitlement.plan === PAYMENT_PLANS.ONE_TIME.id) {
        return (entitlement.remainingAnalyses ?? 0) > 0
      }

      // Check time-based subscriptions
      if (entitlement.expiryDate) {
        return new Date() < new Date(entitlement.expiryDate)
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
      const entitlementJson = await SecureStore.getItemAsync(ENTITLEMENT_KEY)
      if (!entitlementJson) return

      const entitlement: UserEntitlement = JSON.parse(entitlementJson)

      if (entitlement.plan === PAYMENT_PLANS.ONE_TIME.id && entitlement.remainingAnalyses) {
        entitlement.remainingAnalyses -= 1
        await SecureStore.setItemAsync(ENTITLEMENT_KEY, JSON.stringify(entitlement))
      }
    } catch (error) {
      console.error('Error using analysis:', error)
    }
  }

  // Grant access after successful payment
  static async grantAccess(planId: string): Promise<void> {
    try {
      const now = new Date()
      let entitlement: UserEntitlement

      if (planId === PAYMENT_PLANS.ONE_TIME.id) {
        entitlement = {
          plan: planId,
          purchaseDate: now,
          remainingAnalyses: 1,
        }
      } else if (planId === PAYMENT_PLANS.WEEKLY.id) {
        entitlement = {
          plan: planId,
          purchaseDate: now,
          expiryDate: new Date(now.getTime() + PAYMENT_PLANS.WEEKLY.duration),
        }
      } else if (planId === PAYMENT_PLANS.MONTHLY.id) {
        entitlement = {
          plan: planId,
          purchaseDate: now,
          expiryDate: new Date(now.getTime() + PAYMENT_PLANS.MONTHLY.duration),
        }
      } else {
        throw new Error('Invalid plan ID')
      }

      await SecureStore.setItemAsync(ENTITLEMENT_KEY, JSON.stringify(entitlement))
      console.log('✅ Access granted for plan:', planId)
    } catch (error) {
      console.error('Error granting access:', error)
      throw error
    }
  }

  // Get current entitlement info
  static async getEntitlement(): Promise<UserEntitlement | null> {
    try {
      const entitlementJson = await SecureStore.getItemAsync(ENTITLEMENT_KEY)
      if (!entitlementJson) return null

      const entitlement: UserEntitlement = JSON.parse(entitlementJson)
      return {
        ...entitlement,
        purchaseDate: new Date(entitlement.purchaseDate),
        expiryDate: entitlement.expiryDate ? new Date(entitlement.expiryDate) : undefined,
      }
    } catch (error) {
      console.error('Error getting entitlement:', error)
      return null
    }
  }

  // Clear entitlement (for testing or logout)
  static async clearEntitlement(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ENTITLEMENT_KEY)
      console.log('🗑️ Entitlement cleared')
    } catch (error) {
      console.error('Error clearing entitlement:', error)
    }
  }
}
