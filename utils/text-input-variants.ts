import { type Theme } from '@/constants/theme'
import { type ViewStyle, type TextStyle } from 'react-native'

export type TextInputVariant = 'default' | 'outlined' | 'filled'
export type TextInputSize = 'small' | 'medium' | 'large'

interface TextInputSizeStyles {
  container: ViewStyle
  text: TextStyle
  iconSize: number
}

export function getTextInputVariantStyles(
  theme: Theme,
  variant: TextInputVariant,
  error: boolean
): ViewStyle {
  const baseStyle: ViewStyle = {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: error ? theme.colors.error : theme.colors.border,
  }

  const variants: Record<TextInputVariant, ViewStyle> = {
    outlined: {
      ...baseStyle,
      backgroundColor: 'transparent',
    },
    filled: {
      ...baseStyle,
      backgroundColor: theme.colors.backgroundLight,
    },
    default: baseStyle,
  }

  return variants[variant]
}

export function getTextInputSizeStyles(size: TextInputSize): TextInputSizeStyles {
  const sizes: Record<TextInputSize, TextInputSizeStyles> = {
    small: {
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
    },
    medium: {
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
    },
    large: {
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
    },
  }

  return sizes[size]
}
