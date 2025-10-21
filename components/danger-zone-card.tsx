import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { useTranslation } from '@/hooks/use-translation'

interface DangerZoneCardProps {
  title?: string
  description: string
  buttonText: string
  onPress: () => void
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconSize?: number
  isLoading?: boolean
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
  title,
  description,
  buttonText,
  onPress,
  icon = 'alert-circle-outline',
  iconSize = 20,
  isLoading = false,
  style,
}: DangerZoneCardProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const displayTitle = title ?? t('dangerZone.defaultTitle')

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
          <ThemedText style={[styles.dangerTitle, { color: theme.colors.textDanger }]}>{displayTitle}</ThemedText>
        </View>
        <ThemedText style={[styles.dangerDescription, { color: theme.colors.textSecondary }]}>{description}</ThemedText>
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
