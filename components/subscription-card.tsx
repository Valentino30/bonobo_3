import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { formatPrice, type SupportedCurrency } from '@/utils/currency-service'

export interface SubscriptionCardProps {
  name: string
  price: number
  currency: SupportedCurrency
  description: string
  highlight?: string
  isPopular?: boolean
  popularBadgeText?: string
  onPress: () => void
  style?: ViewStyle
  disabled?: boolean
}

/**
 * Reusable subscription plan card component
 * Shows plan name, price, description, and optional highlight/badge
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  name,
  price,
  currency,
  description,
  highlight,
  isPopular = false,
  popularBadgeText = 'POPULAR',
  onPress,
  style,
  disabled = false,
}) => {
  const theme = useTheme()

  // Format price with currency symbol
  const formattedPrice = formatPrice(price, currency)

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.planCard,
        {
          backgroundColor: isPopular ? theme.colors.backgroundSuccess : theme.colors.backgroundInput,
          borderColor: isPopular ? theme.colors.primary : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        isPopular && styles.popularPlan,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Popular Badge */}
      {isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.popularText, { color: theme.colors.textWhite }]}>{popularBadgeText}</Text>
        </View>
      )}

      {/* Plan Header (Name & Price) */}
      <View style={styles.planHeader}>
        <ThemedText style={styles.planName}>{name}</ThemedText>
        <Text style={[styles.planPrice, { color: theme.colors.primary }]}>{formattedPrice}</Text>
      </View>

      {/* Description */}
      <ThemedText style={[styles.planDescription, { color: theme.colors.textSecondary }]}>{description}</ThemedText>

      {/* Optional Highlight */}
      {highlight && <ThemedText style={[styles.planSavings, { color: theme.colors.primary }]}>{highlight}</ThemedText>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
})
