import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
import { SubscriptionCard } from '@/components/subscription-card'
import { useTheme } from '@/contexts/theme-context'
import { PAYMENT_PLANS } from '@/utils/payment-service'
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native'

interface PaywallProps {
  visible: boolean
  onClose: () => void
  onPurchase: (planId: string) => Promise<void>
}

export function Paywall({ visible, onClose, onPurchase }: PaywallProps) {
  const theme = useTheme()

  const handlePurchase = async (planId: string) => {
    // Error handling is done by the parent component
    await onPurchase(planId)
    onClose()
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

            {/* Plans */}
            <View style={styles.plansContainer}>
              {/* One-Time */}
              <SubscriptionCard
                name={PAYMENT_PLANS.ONE_TIME.name}
                price={PAYMENT_PLANS.ONE_TIME.price}
                currency={PAYMENT_PLANS.ONE_TIME.currency}
                description={PAYMENT_PLANS.ONE_TIME.description}
                onPress={() => handlePurchase(PAYMENT_PLANS.ONE_TIME.id)}
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
              />

              {/* Monthly */}
              <SubscriptionCard
                name={PAYMENT_PLANS.MONTHLY.name}
                price={PAYMENT_PLANS.MONTHLY.price}
                currency={PAYMENT_PLANS.MONTHLY.currency}
                description={PAYMENT_PLANS.MONTHLY.description}
                highlight="Maximum flexibility!"
                onPress={() => handlePurchase(PAYMENT_PLANS.MONTHLY.id)}
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
})
