import { useTheme } from '@/contexts/theme-context'
import {
  getTextInputSizeStyles,
  getTextInputVariantStyles,
  type TextInputSize,
  type TextInputVariant,
} from '@/utils/text-input-variants'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { StyleSheet, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native'
import { InfoBanner } from './info-banner'
import { ThemedIconButton } from './themed-icon-button'

export type { TextInputSize, TextInputVariant }

export interface ThemedTextInputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  variant?: TextInputVariant
  size?: TextInputSize
  password?: boolean
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap
  onRightIconPress?: () => void
  error?: boolean
  errorMessage?: string
  fullWidth?: boolean
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
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

  // Get styles from utility functions
  const variantStyles = getTextInputVariantStyles(theme, variant, error)
  const sizeStyles = getTextInputSizeStyles(size)

  // Determine if we should show right icon or password toggle
  const shouldShowRightIcon = rightIcon || password
  const rightIconName = password ? (showPassword ? 'eye-off-outline' : 'eye-outline') : rightIcon

  const handleRightIconPress = () => {
    if (password) {
      setShowPassword(!showPassword)
    } else if (onRightIconPress) {
      onRightIconPress()
    }
  }

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      <View style={[styles.container, variantStyles, sizeStyles.container, disabled && styles.disabled]}>
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
          style={[styles.input, sizeStyles.text, { color: theme.colors.text }, inputStyle]}
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
            style={[styles.rightIcon, { padding: 0 }]}
          />
        )}
      </View>

      {/* Error Message */}
      {error && errorMessage && (
        <View style={styles.errorContainer}>
          <InfoBanner icon="alert-circle-outline" iconSize={14} text={errorMessage} variant="error" />
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
    marginTop: 6,
  },
})
