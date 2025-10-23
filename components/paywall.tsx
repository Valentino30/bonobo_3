import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ModalHeader } from '@/components/modal-header'
import { SubscriptionCard } from '@/components/subscription-card'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { usePaywall } from '@/hooks/use-paywall'
import { useTranslation } from '@/hooks/use-translation'

interface PaywallProps {
  visible: boolean
  onClose: () => void
  onPurchase: (planId: string) => Promise<void>
}

export function Paywall({ visible, onClose, onPurchase }: PaywallProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { paymentPlans, isProcessing, handlePurchase } = usePaywall({ onPurchase, onClose })

  if (!paymentPlans) {
    return null
  }

  const PAYMENT_PLANS = paymentPlans

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
            <ModalHeader emoji="🔮" title={t('paywall.title')} subtitle={t('paywall.subtitle')} />

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
                highlight={t('paywall.bestValue')}
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
                highlight={t('paywall.maxFlexibility')}
                onPress={() => handlePurchase(PAYMENT_PLANS.MONTHLY.id)}
                disabled={isProcessing}
              />
            </View>

            {/* EUR Charge Disclaimer */}
            <View style={[styles.disclaimerContainer, { backgroundColor: theme.colors.backgroundInput }]}>
              <ThemedText style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
                💳 All payments are processed in EUR (€). Your bank may apply currency conversion fees.
              </ThemedText>
            </View>

            {/* Features */}
            <View style={[styles.featuresContainer, { backgroundColor: theme.colors.backgroundInput }]}>
              <ThemedText style={styles.featuresTitle}>{t('paywallFeatures.title')}</ThemedText>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✨</Text>
                <ThemedText style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                  {t('paywallFeatures.aiInsights')}
                </ThemedText>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🎯</Text>
                <ThemedText style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                  {t('paywallFeatures.compatibilityAnalysis')}
                </ThemedText>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💡</Text>
                <ThemedText style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                  {t('paywallFeatures.relationshipTips')}
                </ThemedText>
              </View>
            </View>

            {/* Close Button */}
            <View style={styles.closeButtonContainer}>
              <ThemedButton title={t('common.maybeLater')} onPress={onClose} variant="ghost" size="medium" fullWidth />
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
  plansContainer: {
    gap: 12,
    marginBottom: 24,
  },
  disclaimerContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
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
})
