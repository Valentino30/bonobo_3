import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { getButtonVariantStyles, getButtonSizeStyles, getButtonShadowStyles, getButtonAlignmentStyles, type ButtonAlign } from '@/utils/button-variants'
import { LoadingText } from '@/components/loading-text'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'

export type ButtonSize = 'small' | 'medium' | 'large'

export interface ThemedButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  loadingTitle?: string
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  activeOpacity?: number
  uppercase?: boolean
  shadow?: boolean
  align?: ButtonAlign
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  loadingTitle,
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
  const alignmentStyles = getButtonAlignmentStyles(align)

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
        alignmentStyles,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <>
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, uppercase && styles.uppercase, textStyle]}>
            {loadingTitle || title}
          </Text>
          <LoadingText color={String(variantStyles.text.color)} />
        </>
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
