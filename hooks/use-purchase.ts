import { useState } from 'react'
import { AuthService } from '@/utils/auth-service'
import { PaymentService } from '@/utils/payment-service'
import { StripeService } from '@/utils/stripe-service'

type UsePurchaseOptions = {
  chatId: string
  showAlert: (title: string, message: string) => void
  onShowAuthScreen: () => void
  onSwitchToInsightsTab: () => void
  onUnlockInsight: (insightId: string) => void
}

export function usePurchase(options: UsePurchaseOptions) {
  const { chatId, showAlert, onShowAuthScreen, onSwitchToInsightsTab, onUnlockInsight } = options

  const [pendingInsightToUnlock, setPendingInsightToUnlock] = useState<string | null>(null)

  const handlePurchase = async (planId: string) => {
    try {
      const result = await StripeService.initializePayment(planId, chatId)

      if (result.success) {
        showAlert('Payment Processing', 'Your payment is being processed. You can unlock insights in a moment.')

        // Check authentication
        const isAuthenticated = await AuthService.isAuthenticated()

        if (!isAuthenticated) {
          onShowAuthScreen()
        } else {
          onSwitchToInsightsTab()
        }

        // Poll for entitlement
        const maxAttempts = 10
        const pollInterval = 1000

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval))
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          const hasAccess = await PaymentService.hasAccess(chatId)

          if (hasAccess) {
            showAlert('🎉 Payment Successful!', 'Unlocking your insight now...')

            if (pendingInsightToUnlock) {
              setTimeout(() => onUnlockInsight(pendingInsightToUnlock), 500)
              setPendingInsightToUnlock(null)
            }
            break
          }

          // Manual verification fallback
          if (attempt === maxAttempts) {
            if (result.paymentIntentId) {
              const verified = await PaymentService.verifyPayment(result.paymentIntentId, planId, chatId)

              if (verified) {
                showAlert('🎉 Payment Verified!', 'Unlocking your insight now...')

                if (pendingInsightToUnlock) {
                  setTimeout(() => onUnlockInsight(pendingInsightToUnlock), 500)
                  setPendingInsightToUnlock(null)
                }
              } else {
                showAlert(
                  '⏳ Payment Processing',
                  'Your payment was successful but verification is taking longer than expected. Please wait a moment and try unlocking again. If the problem persists, contact support.'
                )
              }
            } else {
              showAlert(
                '⏳ Payment Processing',
                'Your payment was successful but verification is taking longer than expected. Please wait a moment and try unlocking again. If the problem persists, contact support.'
              )
            }
          }
        }
      } else {
        if (result.error) {
          showAlert('Payment Failed', result.error)
        }
      }
    } catch (error) {
      showAlert('Error', 'Failed to process payment. Please try again.')
    }
  }

  return {
    pendingInsightToUnlock,
    setPendingInsightToUnlock,
    handlePurchase,
  }
}
