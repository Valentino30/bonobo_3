import { useState, useEffect } from 'react'
import { getPaymentPlans, type PaymentPlan } from '@/utils/payment-service'
import { CurrencyService, type SupportedCurrency } from '@/utils/currency-service'

interface UsePaywallOptions {
  visible: boolean
  onPurchase: (planId: string) => Promise<void>
  onClose: () => void
}

export function usePaywall({ visible, onPurchase, onClose }: UsePaywallOptions) {
  const [paymentPlans, setPaymentPlans] = useState<Record<string, PaymentPlan> | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD')
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load payment plans when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadPaymentPlans()
      // Reset processing state when modal opens
      setIsProcessing(false)
    }
  }, [visible, selectedCurrency])

  const loadPaymentPlans = async () => {
    const plans = await getPaymentPlans()
    setPaymentPlans(plans)
    setSelectedCurrency(plans.ONE_TIME.currency)

    console.log('💳 Paywall opened - Payment plans:', {
      oneTime: `${plans.ONE_TIME.currency} ${plans.ONE_TIME.price}`,
      weekly: `${plans.WEEKLY.currency} ${plans.WEEKLY.price}`,
      monthly: `${plans.MONTHLY.currency} ${plans.MONTHLY.price}`,
    })
  }

  const handleCurrencyChange = async (currency: SupportedCurrency) => {
    await CurrencyService.setCurrencyOverride(currency)
    setSelectedCurrency(currency)
    setShowCurrencyPicker(false)
    await loadPaymentPlans()
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
