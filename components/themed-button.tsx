import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle, Animated, View } from 'react-native'
import { getButtonVariantStyles, getButtonSizeStyles, getButtonShadowStyles, getButtonAlignmentStyles, type ButtonAlign } from '@/utils/button-variants'
import { useEffect, useRef } from 'react'

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

const BouncingDots: React.FC<{ color: string }> = ({ color }) => {
  const bounce1 = useRef(new Animated.Value(0)).current
  const bounce2 = useRef(new Animated.Value(0)).current
  const bounce3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const createBounceAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: -3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    }

    const animation = Animated.loop(
      Animated.parallel([
        createBounceAnimation(bounce1, 0),
        createBounceAnimation(bounce2, 150),
        createBounceAnimation(bounce3, 300),
      ])
    )

    animation.start()

    return () => animation.stop()
  }, [bounce1, bounce2, bounce3])

  return (
    <View style={styles.dotsContainer}>
      <Animated.Text style={[styles.dot, { color, transform: [{ translateY: bounce1 }] }]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, { color, transform: [{ translateY: bounce2 }] }]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, { color, transform: [{ translateY: bounce3 }] }]}>.</Animated.Text>
    </View>
  )
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
          <BouncingDots color={String(variantStyles.text.color)} />
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
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: 16,
    fontWeight: '600',
  },
})
