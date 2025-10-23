import { useState } from 'react'
import { usePurchaseMutation } from '@/hooks/queries/use-purchase-mutation'
import i18n from '@/i18n/config'

type UsePaymentFlowOptions = {
  chatId: string
  showAlert: (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => void
  onPurchaseSuccess?: () => void
}

/**
 * Hook for managing payment flow including purchase and authentication
 */
export function usePaymentFlow({ chatId, showAlert, onPurchaseSuccess }: UsePaymentFlowOptions) {
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuthScreen, setShowAuthScreen] = useState(false)

  const purchaseMutation = usePurchaseMutation()

  const handlePurchase = async (planId: string) => {
    try {
      const result = await purchaseMutation.mutateAsync({
        planId,
        chatId,
      })

      showAlert(i18n.t('analysisErrors.paymentProcessing'), i18n.t('analysisErrors.paymentProcessingMessage'))

      if (result.requiresAuth) {
        setShowAuthScreen(true)
        return { success: false, requiresAuth: true }
      }

      if (result.success) {
        showAlert(i18n.t('analysisErrors.paymentSuccessful'), i18n.t('analysisErrors.paymentSuccessfulMessage'))
        onPurchaseSuccess?.()
        return { success: true, requiresAuth: false }
      }

      return { success: false, requiresAuth: false }
    } catch (error: any) {
      if (error.message === 'VERIFICATION_TIMEOUT') {
        showAlert(i18n.t('analysisErrors.verificationTimeout'), i18n.t('analysisErrors.verificationTimeoutMessage'))
      } else {
        showAlert(i18n.t('analysisErrors.paymentFailed'), error.message || i18n.t('analysisErrors.paymentFailed'))
      }
      return { success: false, requiresAuth: false }
    }
  }

  return {
    showPaywall,
    setShowPaywall,
    showAuthScreen,
    setShowAuthScreen,
    handlePurchase,
    isProcessing: purchaseMutation.isPending,
  }
}
