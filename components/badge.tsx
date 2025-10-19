import { ThemedText } from '@/components/themed-text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

interface BadgeProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconSize?: number
  iconColor?: string
  text: string
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  containerStyle?: ViewStyle
}

export function Badge({
  icon,
  iconSize = 16,
  iconColor,
  text,
  textColor,
  backgroundColor,
  borderColor,
  variant = 'default',
  containerStyle,
}: BadgeProps) {
  const theme = useTheme()

  const variantStyles = {
    default: {
      backgroundColor: backgroundColor || theme.colors.backgroundSecondary,
      borderColor: borderColor || theme.colors.border,
      textColor: textColor || theme.colors.text,
      iconColor: iconColor || theme.colors.text,
    },
    primary: {
      backgroundColor: backgroundColor || theme.colors.backgroundInfo,
      borderColor: borderColor || theme.colors.primaryLighter,
      textColor: textColor || theme.colors.primary,
      iconColor: iconColor || theme.colors.primary,
    },
    success: {
      backgroundColor: backgroundColor || theme.colors.backgroundSuccess,
      borderColor: borderColor || theme.colors.primaryLighter,
      textColor: textColor || theme.colors.successDark,
      iconColor: iconColor || theme.colors.successDark,
    },
    warning: {
      backgroundColor: backgroundColor || theme.colors.backgroundInfo,
      borderColor: borderColor || theme.colors.primaryLighter,
      textColor: textColor || theme.colors.warning,
      iconColor: iconColor || theme.colors.warning,
    },
    error: {
      backgroundColor: backgroundColor || theme.colors.backgroundError,
      borderColor: borderColor || theme.colors.errorLight,
      textColor: textColor || theme.colors.error,
      iconColor: iconColor || theme.colors.error,
    },
  }

  const style = variantStyles[variant]

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
          },
        ]}
      >
        {icon && <MaterialCommunityIcons name={icon} size={iconSize} color={style.iconColor} />}
        <ThemedText style={[styles.text, { color: style.textColor }]}>{text}</ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
})
