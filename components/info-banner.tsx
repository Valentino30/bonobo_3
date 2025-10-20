import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, Text, View } from 'react-native'

type InfoBannerProps = {
  /** Icon name from MaterialCommunityIcons */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  /** Size of the icon */
  iconSize?: number
  /** Banner text content */
  text: string
  /** Visual variant */
  variant?: 'info' | 'success' | 'warning' | 'error'
}

/**
 * Lightweight banner component for displaying tips, hints, or status messages
 * Displays icon and text horizontally in a compact format
 */
export function InfoBanner({ icon = 'lightbulb-on-outline', iconSize = 18, text, variant = 'info' }: InfoBannerProps) {
  const theme = useTheme()

  const variantStyles = {
    info: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      iconColor: theme.colors.primary,
      textColor: theme.colors.primaryDark,
    },
    success: {
      backgroundColor: theme.colors.backgroundSuccess,
      borderColor: theme.colors.primaryLighter,
      iconColor: theme.colors.success,
      textColor: theme.colors.successDark,
    },
    warning: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      iconColor: theme.colors.warning,
      textColor: theme.colors.textSecondary,
    },
    error: {
      backgroundColor: theme.colors.backgroundError,
      borderColor: theme.colors.errorLight,
      iconColor: theme.colors.error,
      textColor: theme.colors.textError,
    },
  }

  const style = variantStyles[variant]

  return (
    <View style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      <MaterialCommunityIcons name={icon} size={iconSize} color={style.iconColor} />
      <Text style={[styles.text, { color: style.textColor }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
})
