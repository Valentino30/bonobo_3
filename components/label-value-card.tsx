import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

interface LabelValueCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  label: string
  value: string
  iconSize?: number
  iconColor?: string
  style?: StyleProp<ViewStyle>
}

/**
 * Reusable card component for displaying label-value pairs with an icon.
 * Commonly used in profile or settings screens.
 *
 * @example
 * <LabelValueCard
 *   icon="email-outline"
 *   label="Email"
 *   value="user@example.com"
 * />
 */
export function LabelValueCard({
  icon,
  label,
  value,
  iconSize = 20,
  iconColor,
  style,
}: LabelValueCardProps) {
  const theme = useTheme()

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.backgroundLight,
            borderColor: theme.colors.border,
          },
          style,
        ]}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={iconColor || theme.colors.primary}
          />
          <ThemedText style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>
            {label}
          </ThemedText>
        </View>
        <ThemedText style={[styles.cardValue, { color: theme.colors.text }]}>{value}</ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '400',
  },
})
