import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
import { SubscriptionCard } from '@/components/subscription-card'
import { useTheme } from '@/contexts/theme-context'
import { getPaymentPlans, type PaymentPlan } from '@/utils/payment-service'
import { CurrencyService, CURRENCY_PRICING, type SupportedCurrency } from '@/utils/currency-service'
import { Modal, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'

interface PaywallProps {
  visible: boolean
  onClose: () => void
  onPurchase: (planId: string) => Promise<void>
}

export function Paywall({ visible, onClose, onPurchase }: PaywallProps) {
  const theme = useTheme()
  const [paymentPlans, setPaymentPlans] = useState<Record<string, PaymentPlan> | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD')
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load payment plans
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

  if (!paymentPlans) {
    return null
  }

  const PAYMENT_PLANS = paymentPlans

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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.backgroundOverlay }]}>
        <ThemedView style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🔮</Text>
              <ThemedText type="title" style={styles.title}>
                Unlock AI Insights
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Get deep relationship analysis powered by advanced AI</ThemedText>
            </View>

            {/* Currency Selector */}
            <TouchableOpacity
              style={[styles.currencySelector, { backgroundColor: theme.colors.backgroundInput }]}
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            >
              <ThemedText style={styles.currencyLabel}>Currency:</ThemedText>
              <View style={styles.currencyValue}>
                <ThemedText style={styles.currencyText}>
                  {CURRENCY_PRICING[selectedCurrency].symbol} {selectedCurrency}
                </ThemedText>
                <ThemedText style={styles.currencyArrow}>{showCurrencyPicker ? '▲' : '▼'}</ThemedText>
              </View>
            </TouchableOpacity>

            {/* Currency Picker Dropdown */}
            {showCurrencyPicker && (
              <View style={[styles.currencyDropdown, { backgroundColor: theme.colors.backgroundInput }]}>
                {(Object.keys(CURRENCY_PRICING) as SupportedCurrency[]).map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyOption,
                      selectedCurrency === currency && { backgroundColor: theme.colors.primary + '20' },
                    ]}
                    onPress={() => handleCurrencyChange(currency)}
                  >
                    <ThemedText
                      style={[
                        styles.currencyOptionText,
                        selectedCurrency === currency && { color: theme.colors.primary, fontWeight: '600' },
                      ]}
                    >
                      {CURRENCY_PRICING[currency].symbol} {currency}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Plans */}
            <View style={styles.plansContainer}>
              {/* One-Time */}
              <SubscriptionCard
                name={PAYMENT_PLANS.ONE_TIME.name}
                price={PAYMENT_PLANS.ONE_TIME.price}
                currency={PAYMENT_PLANS.ONE_TIME.currency}
                description={PAYMENT_PLANS.ONE_TIME.description}
                onPress={() => handlePurchase(PAYMENT_PLANS.ONE_TIME.id)}
                disabled={isProcessing}
              />

              {/* Weekly - Popular */}
              <SubscriptionCard
                name={PAYMENT_PLANS.WEEKLY.name}
                price={PAYMENT_PLANS.WEEKLY.price}
                currency={PAYMENT_PLANS.WEEKLY.currency}
                description={PAYMENT_PLANS.WEEKLY.description}
                highlight="Best value per day!"
                isPopular
                onPress={() => handlePurchase(PAYMENT_PLANS.WEEKLY.id)}
                disabled={isProcessing}
              />

              {/* Monthly */}
              <SubscriptionCard
                name={PAYMENT_PLANS.MONTHLY.name}
                price={PAYMENT_PLANS.MONTHLY.price}
                currency={PAYMENT_PLANS.MONTHLY.currency}
                description={PAYMENT_PLANS.MONTHLY.description}
                highlight="Maximum flexibility!"
                onPress={() => handlePurchase(PAYMENT_PLANS.MONTHLY.id)}
                disabled={isProcessing}
              />
            </View>

            {/* Features */}
            <View style={[styles.featuresContainer, { backgroundColor: theme.colors.backgroundInput }]}>
              <ThemedText style={styles.featuresTitle}>What you&apos;ll get:</ThemedText>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✨</Text>
                <ThemedText style={[styles.featureText, { color: theme.colors.textSecondary }]}>AI-powered relationship insights</ThemedText>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🎯</Text>
                <ThemedText style={[styles.featureText, { color: theme.colors.textSecondary }]}>Personalized compatibility analysis</ThemedText>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💡</Text>
                <ThemedText style={[styles.featureText, { color: theme.colors.textSecondary }]}>Actionable relationship tips</ThemedText>
              </View>
            </View>

            {/* Close Button */}
            <View style={styles.closeButtonContainer}>
              <ThemedButton
                title="Maybe Later"
                onPress={onClose}
                variant="ghost"
                size="medium"
                fullWidth
              />
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featuresContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
  },
  closeButtonContainer: {
    paddingTop: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  currencyValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyArrow: {
    fontSize: 12,
    opacity: 0.6,
  },
  currencyDropdown: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  currencyOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  currencyOptionText: {
    fontSize: 14,
  },
})
