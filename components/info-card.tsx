import { ThemedText } from '@/components/themed-text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

interface InfoCardProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconColor?: string
  iconSize?: number
  title: string
  description: string
  variant?: 'info' | 'success' | 'warning' | 'error'
}

export function InfoCard({
  icon = 'information',
  iconColor,
  iconSize = 24,
  title,
  description,
  variant = 'info',
}: InfoCardProps) {
  const theme = useTheme()

  const variantStyles = {
    info: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      titleColor: theme.colors.primary,
      textColor: theme.colors.primaryDark,
      iconColor: iconColor || theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.backgroundSuccess,
      borderColor: theme.colors.primaryLighter,
      titleColor: theme.colors.successDark,
      textColor: theme.colors.successDark,
      iconColor: iconColor || theme.colors.successDark,
    },
    warning: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      titleColor: theme.colors.warning,
      textColor: theme.colors.textSecondary,
      iconColor: iconColor || theme.colors.warning,
    },
    error: {
      backgroundColor: theme.colors.backgroundError,
      borderColor: theme.colors.errorLight,
      titleColor: theme.colors.error,
      textColor: theme.colors.textError,
      iconColor: iconColor || theme.colors.error,
    },
  }

  const style = variantStyles[variant]

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name={icon} size={iconSize} color={style.iconColor} />
        <ThemedText style={[styles.title, { color: style.titleColor }]}>{title}</ThemedText>
      </View>
      <ThemedText style={[styles.description, { color: style.textColor }]}>{description}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
})
