import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { PAYMENT_PLANS } from '@/utils/payment-service'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
              <TouchableOpacity style={[styles.planCard, { backgroundColor: theme.colors.backgroundInput }]} onPress={() => handlePurchase(PAYMENT_PLANS.ONE_TIME.id)}>
                <View style={styles.planHeader}>
                  <ThemedText style={styles.planName}>{PAYMENT_PLANS.ONE_TIME.name}</ThemedText>
                  <Text style={[styles.planPrice, { color: theme.colors.primary }]}>${PAYMENT_PLANS.ONE_TIME.price}</Text>
                </View>
                <ThemedText style={[styles.planDescription, { color: theme.colors.textSecondary }]}>{PAYMENT_PLANS.ONE_TIME.description}</ThemedText>
              </TouchableOpacity>

              {/* Weekly - Popular */}
              <TouchableOpacity
                style={[styles.planCard, styles.popularPlan, { backgroundColor: theme.colors.backgroundSuccess, borderColor: theme.colors.primary }]}
                onPress={() => handlePurchase(PAYMENT_PLANS.WEEKLY.id)}
              >
                <View style={[styles.popularBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.popularText, { color: theme.colors.textWhite }]}>POPULAR</Text>
                </View>
                <View style={styles.planHeader}>
                  <ThemedText style={styles.planName}>{PAYMENT_PLANS.WEEKLY.name}</ThemedText>
                  <Text style={[styles.planPrice, { color: theme.colors.primary }]}>${PAYMENT_PLANS.WEEKLY.price}</Text>
                </View>
                <ThemedText style={[styles.planDescription, { color: theme.colors.textSecondary }]}>{PAYMENT_PLANS.WEEKLY.description}</ThemedText>
                <ThemedText style={[styles.planSavings, { color: theme.colors.primary }]}>Best value per day!</ThemedText>
              </TouchableOpacity>

              {/* Monthly */}
              <TouchableOpacity style={[styles.planCard, { backgroundColor: theme.colors.backgroundInput }]} onPress={() => handlePurchase(PAYMENT_PLANS.MONTHLY.id)}>
                <View style={styles.planHeader}>
                  <ThemedText style={styles.planName}>{PAYMENT_PLANS.MONTHLY.name}</ThemedText>
                  <Text style={[styles.planPrice, { color: theme.colors.primary }]}>${PAYMENT_PLANS.MONTHLY.price}</Text>
                </View>
                <ThemedText style={[styles.planDescription, { color: theme.colors.textSecondary }]}>{PAYMENT_PLANS.MONTHLY.description}</ThemedText>
                <ThemedText style={[styles.planSavings, { color: theme.colors.primary }]}>Maximum flexibility!</ThemedText>
              </TouchableOpacity>
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
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={[styles.closeButtonText, { color: theme.colors.textTertiary }]}>Maybe Later</ThemedText>
            </TouchableOpacity>
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
  planCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularPlan: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  planSavings: {
    fontSize: 12,
    fontWeight: '500',
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
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
  },
})
