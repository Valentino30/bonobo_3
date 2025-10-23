import { useState } from 'react'
import { usePaymentPlansQuery } from './queries/use-purchase-mutation'

interface UsePaywallOptions {
  onPurchase: (planId: string) => Promise<void>
  onClose: () => void
}

export function usePaywall({ onPurchase, onClose }: UsePaywallOptions) {
  // React Query hooks
  const { data: paymentPlans } = usePaymentPlansQuery()

  // UI state
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (planId: string) => {
    // Prevent multiple payment sheets from opening
    if (isProcessing) {
      console.log('⚠️ Payment already in progress, ignoring duplicate tap')
      return
    }

    console.log('💳 Starting payment flow for plan:', planId)
    setIsProcessing(true)

    try {
      // Error handling is done by the parent component
      await onPurchase(planId)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    paymentPlans,
    isProcessing,
    handlePurchase,
  }
}
