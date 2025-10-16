import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'

export type ButtonSize = 'small' | 'medium' | 'large'

export interface ThemedButtonProps {
  /** Button text content */
  title: string
  /** Click handler */
  onPress: () => void
  /** Visual variant of the button */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Disabled state */
  disabled?: boolean
  /** Loading state (shows spinner) */
  loading?: boolean
  /** Icon name from MaterialCommunityIcons */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  /** Icon position */
  iconPosition?: 'left' | 'right'
  /** Full width button */
  fullWidth?: boolean
  /** Custom style override */
  style?: ViewStyle
  /** Custom text style override */
  textStyle?: TextStyle
  /** Active opacity (default 0.7) */
  activeOpacity?: number
  /** Uppercase text transform */
  uppercase?: boolean
  /** Show shadow effect */
  shadow?: boolean
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  activeOpacity = 0.7,
  uppercase = false,
  shadow = false,
}) => {
  const theme = useTheme()

  // Determine if button is disabled or loading
  const isDisabled = disabled || loading

  // Get variant styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.primaryLight : theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.textWhite,
            fontWeight: '600',
          },
        }

      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.backgroundLight,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          text: {
            color: theme.colors.text,
            fontWeight: '500',
          },
        }

      case 'destructive':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.errorLight : theme.colors.error,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.textWhite,
            fontWeight: '600',
          },
        }

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: theme.colors.primary,
            fontWeight: '500',
          },
        }

      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.primary,
            fontWeight: '500',
          },
        }

      default:
        return {
          container: {
            backgroundColor: theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.textWhite,
            fontWeight: '600',
          },
        }
    }
  }

  // Get size styles
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
          },
          text: {
            fontSize: 14,
          },
          iconSize: 16,
        }

      case 'medium':
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
          },
          text: {
            fontSize: 16,
          },
          iconSize: 18,
        }

      case 'large':
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
          },
          text: {
            fontSize: 16,
          },
          iconSize: 20,
        }

      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
          },
          text: {
            fontSize: 16,
          },
          iconSize: 18,
        }
    }
  }

  // Get shadow styles
  const getShadowStyles = (): ViewStyle => {
    if (!shadow || variant === 'ghost' || variant === 'outline') {
      return {}
    }

    return {
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()
  const shadowStyles = getShadowStyles()

  // Icon color
  const iconColor = variantStyles.text.color

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        shadowStyles,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size={sizeStyles.iconSize} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons name={icon} size={sizeStyles.iconSize} color={iconColor} style={styles.iconLeft} />
          )}

          <Text style={[styles.text, variantStyles.text, sizeStyles.text, uppercase && styles.uppercase, textStyle]}>
            {title}
          </Text>

          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons name={icon} size={sizeStyles.iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    letterSpacing: 0.5,
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
})
