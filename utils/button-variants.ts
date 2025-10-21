import { type Theme } from '@/constants/theme'
import { type ViewStyle, type TextStyle } from 'react-native'
import type { ButtonVariant, ButtonSize } from '@/components/themed-button'

export type ButtonAlign = 'left' | 'center' | 'right'

interface ButtonVariantStyles {
  container: ViewStyle
  text: TextStyle
}

interface ButtonSizeStyles {
  container: ViewStyle
  text: TextStyle
  iconSize: number
}

export function getButtonVariantStyles(
  theme: Theme,
  variant: ButtonVariant,
  isDisabled: boolean
): ButtonVariantStyles {
  const variants: Record<ButtonVariant, ButtonVariantStyles> = {
    primary: {
      container: {
        backgroundColor: isDisabled ? theme.colors.primaryLight : theme.colors.primary,
        borderWidth: 0,
      },
      text: {
        color: theme.colors.textWhite,
        fontWeight: '600',
      },
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.backgroundLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      text: {
        color: theme.colors.text,
        fontWeight: '500',
      },
    },
    destructive: {
      container: {
        backgroundColor: isDisabled ? theme.colors.errorLight : theme.colors.error,
        borderWidth: 0,
      },
      text: {
        color: theme.colors.textWhite,
        fontWeight: '600',
      },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      text: {
        color: theme.colors.primary,
        fontWeight: '500',
      },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      text: {
        color: theme.colors.primary,
        fontWeight: '500',
      },
    },
  }

  return variants[variant]
}

export function getButtonSizeStyles(size: ButtonSize): ButtonSizeStyles {
  const sizes: Record<ButtonSize, ButtonSizeStyles> = {
    small: {
      container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
      },
      text: {
        fontSize: 14,
      },
      iconSize: 16,
    },
    medium: {
      container: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
      },
      text: {
        fontSize: 16,
      },
      iconSize: 18,
    },
    large: {
      container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
      },
      text: {
        fontSize: 16,
      },
      iconSize: 20,
    },
  }

  return sizes[size]
}

export function getButtonShadowStyles(
  theme: Theme,
  shadow: boolean,
  variant: ButtonVariant
): ViewStyle {
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

export function getButtonAlignmentStyles(align: ButtonAlign): ViewStyle {
  const alignments: Record<ButtonAlign, ViewStyle> = {
    left: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    right: { justifyContent: 'flex-end' },
  }

  return alignments[align]
}
