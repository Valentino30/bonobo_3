import { useState } from 'react'
import { type SupportedCurrency } from '@/utils/currency-service'
import { useCurrencyChangeMutation, usePaymentPlansQuery } from './queries/use-purchase-mutation'

interface UsePaywallOptions {
  visible: boolean
  onPurchase: (planId: string) => Promise<void>
  onClose: () => void
}

export function usePaywall({ visible, onPurchase, onClose }: UsePaywallOptions) {
  // React Query hooks
  const { data: paymentPlans } = usePaymentPlansQuery()
  const currencyChangeMutation = useCurrencyChangeMutation()

  // UI state
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Derived state
  const selectedCurrency = paymentPlans?.ONE_TIME.currency || 'USD'

  const handleCurrencyChange = async (currency: SupportedCurrency) => {
    await currencyChangeMutation.mutateAsync(currency)
    setShowCurrencyPicker(false)
  }

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
    selectedCurrency,
    showCurrencyPicker,
    setShowCurrencyPicker,
    isProcessing,
    handleCurrencyChange,
    handlePurchase,
  }
}
