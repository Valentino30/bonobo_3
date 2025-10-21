import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { getButtonVariantStyles, getButtonSizeStyles, getButtonShadowStyles } from '@/utils/button-variants'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'

export type ButtonSize = 'small' | 'medium' | 'large'

export interface ThemedButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  activeOpacity?: number
  uppercase?: boolean
  shadow?: boolean
  align?: 'left' | 'center' | 'right'
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
  align = 'center',
}) => {
  const theme = useTheme()

  // Determine if button is disabled or loading
  const isDisabled = disabled || loading

  // Get styles from utility functions
  const variantStyles = getButtonVariantStyles(theme, variant, isDisabled)
  const sizeStyles = getButtonSizeStyles(size)
  const shadowStyles = getButtonShadowStyles(theme, shadow, variant)

  // Icon color
  const iconColor = variantStyles.text.color

  // Get alignment style
  const getAlignmentStyle = (): ViewStyle => {
    switch (align) {
      case 'left':
        return { justifyContent: 'flex-start' }
      case 'right':
        return { justifyContent: 'flex-end' }
      case 'center':
      default:
        return { justifyContent: 'center' }
    }
  }

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
        getAlignmentStyle(),
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
