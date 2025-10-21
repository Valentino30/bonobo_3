import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthService } from '@/utils/auth-service'
import { PaymentService } from '@/utils/payment-service'
import { StripeService } from '@/utils/stripe-service'
import { analysisKeys } from './use-analysis-query'
import { chatKeys } from './use-chats-query'

type PurchaseParams = {
  planId: string
  chatId: string
  onShowAuthScreen?: () => void
  onSwitchToInsightsTab?: () => void
}

// Mutation: Purchase/payment flow
export function usePurchaseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, chatId }: PurchaseParams) => {
      const result = await StripeService.initializePayment(planId, chatId)

      if (!result.success) {
        throw new Error(result.error || 'Payment failed')
      }

      // Check authentication
      const isAuthenticated = await AuthService.isAuthenticated()

      // Poll for entitlement (max 10 attempts)
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
          return { success: true, isAuthenticated, requiresAuth: !isAuthenticated }
        }

        // Manual verification fallback on last attempt
        if (attempt === maxAttempts) {
          if (result.paymentIntentId) {
            const verified = await PaymentService.verifyPayment(result.paymentIntentId, planId, chatId)

            if (verified) {
              return { success: true, isAuthenticated, requiresAuth: !isAuthenticated }
            }
          }

          throw new Error('VERIFICATION_TIMEOUT')
        }
      }

      throw new Error('POLLING_TIMEOUT')
    },
    onSuccess: (data, { chatId }) => {
      // Invalidate all chat and analysis queries to reflect new access
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.list() })
      queryClient.invalidateQueries({ queryKey: analysisKeys.detail(chatId) })
      queryClient.invalidateQueries({ queryKey: analysisKeys.aiInsights(chatId) })
    },
  })
}
