import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

interface DangerZoneCardProps {
  /**
   * Title for the danger zone (default: "Danger Zone")
   */
  title?: string

  /**
   * Description text explaining the action
   */
  description: string

  /**
   * Button text for the destructive action
   */
  buttonText: string

  /**
   * Callback when the destructive action button is pressed
   */
  onPress: () => void

  /**
   * Icon name from MaterialCommunityIcons (default: "alert-circle-outline")
   */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap

  /**
   * Icon size (default: 20)
   */
  iconSize?: number

  /**
   * Whether the action is in progress (for loading state)
   */
  isLoading?: boolean

  /**
   * Additional custom styles for the container
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Reusable danger zone card for displaying destructive actions with warnings.
 * Features a distinct red/danger styling to alert users about irreversible actions.
 *
 * @example
 * <DangerZoneCard
 *   description="Permanently delete your account and all data. This cannot be undone."
 *   buttonText="Delete Account"
 *   onPress={handleDeleteAccount}
 * />
 *
 * @example
 * // Custom title and icon
 * <DangerZoneCard
 *   title="Clear All Data"
 *   description="Remove all chats and insights from your device."
 *   buttonText="Clear Data"
 *   icon="delete-forever"
 *   onPress={handleClearData}
 * />
 */
export function DangerZoneCard({
  title = 'Danger Zone',
  description,
  buttonText,
  onPress,
  icon = 'alert-circle-outline',
  iconSize = 20,
  isLoading = false,
  style,
}: DangerZoneCardProps) {
  const theme = useTheme()

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.dangerCard,
          {
            backgroundColor: theme.colors.backgroundDanger,
            borderColor: theme.colors.borderDanger,
          },
          style,
        ]}
      >
        <View style={styles.dangerHeader}>
          <MaterialCommunityIcons name={icon} size={iconSize} color={theme.colors.textDanger} />
          <ThemedText style={[styles.dangerTitle, { color: theme.colors.textDanger }]}>{title}</ThemedText>
        </View>
        <ThemedText style={[styles.dangerDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </ThemedText>
        <ThemedButton
          title={buttonText}
          onPress={onPress}
          variant="destructive"
          size="medium"
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  dangerCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
})
