import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native'
import { ThemedIconButton } from './themed-icon-button'

export type TextInputVariant = 'default' | 'outlined' | 'filled'

export type TextInputSize = 'small' | 'medium' | 'large'

export interface ThemedTextInputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Visual variant of the input */
  variant?: TextInputVariant
  /** Size of the input */
  size?: TextInputSize
  /** Password input (shows/hides toggle button) */
  password?: boolean
  /** Icon name from MaterialCommunityIcons (left side) */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  /** Icon name from MaterialCommunityIcons (right side) */
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap
  /** Right icon press handler */
  onRightIconPress?: () => void
  /** Error state */
  error?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Full width input */
  fullWidth?: boolean
  /** Custom container style override */
  containerStyle?: ViewStyle
  /** Custom input style override */
  inputStyle?: TextStyle
  /** Disabled state */
  disabled?: boolean
}

export const ThemedTextInput = ({
  variant = 'default',
  size = 'medium',
  password = false,
  icon,
  rightIcon,
  onRightIconPress,
  error = false,
  errorMessage,
  fullWidth = false,
  containerStyle,
  inputStyle,
  disabled = false,
  ...textInputProps
}: ThemedTextInputProps) => {
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.border,
    }

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        }

      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.backgroundLight,
        }

      case 'default':
      default:
        return baseStyle
    }
  }

  // Get size styles
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'small':
        return {
          container: {
            minHeight: 40,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          },
          text: {
            fontSize: 14,
          },
          iconSize: 18,
        }

      case 'medium':
        return {
          container: {
            minHeight: 48,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
          },
          text: {
            fontSize: 15,
          },
          iconSize: 20,
        }

      case 'large':
        return {
          container: {
            minHeight: 56,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
          },
          text: {
            fontSize: 16,
          },
          iconSize: 22,
        }

      default:
        return {
          container: {
            minHeight: 48,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
          },
          text: {
            fontSize: 15,
          },
          iconSize: 20,
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  // Determine if we should show right icon or password toggle
  const shouldShowRightIcon = rightIcon || password
  const rightIconName = password
    ? (showPassword ? 'eye-off-outline' : 'eye-outline')
    : rightIcon

  const handleRightIconPress = () => {
    if (password) {
      setShowPassword(!showPassword)
    } else if (onRightIconPress) {
      onRightIconPress()
    }
  }

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      <View
        style={[
          styles.container,
          variantStyles,
          sizeStyles.container,
          disabled && styles.disabled,
        ]}
      >
        {/* Left Icon */}
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={sizeStyles.iconSize}
            color={theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            sizeStyles.text,
            { color: theme.colors.text },
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.textPlaceholder}
          editable={!disabled}
          secureTextEntry={password && !showPassword}
          {...textInputProps}
        />

        {/* Right Icon or Password Toggle */}
        {shouldShowRightIcon && rightIconName && (
          <ThemedIconButton
            icon={rightIconName}
            onPress={handleRightIconPress}
            variant="ghost"
            size="small"
            style={styles.rightIcon}
          />
        )}
      </View>

      {/* Error Message */}
      {error && errorMessage && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={14}
            color={theme.colors.error}
            style={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errorMessage}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
})
