import { type Theme } from '@/constants/theme'

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'default'
export type IconButtonSize = 'small' | 'medium' | 'large'

interface IconButtonVariantStyles {
  iconColor: string
  backgroundColor?: string
}

interface IconButtonSizeStyles {
  iconSize: number
  padding: number
}

export function getIconButtonVariantStyles(
  theme: Theme,
  variant: IconButtonVariant
): IconButtonVariantStyles {
  const variants: Record<IconButtonVariant, IconButtonVariantStyles> = {
    primary: {
      iconColor: theme.colors.primary,
      backgroundColor: 'transparent',
    },
    secondary: {
      iconColor: theme.colors.textSecondary,
      backgroundColor: 'transparent',
    },
    ghost: {
      iconColor: theme.colors.textTertiary,
      backgroundColor: 'transparent',
    },
    default: {
      iconColor: theme.colors.text,
      backgroundColor: 'transparent',
    },
  }

  return variants[variant]
}

export function getIconButtonSizeStyles(size: IconButtonSize): IconButtonSizeStyles {
  const sizes: Record<IconButtonSize, IconButtonSizeStyles> = {
    small: {
      iconSize: 18,
      padding: 6,
    },
    medium: {
      iconSize: 24,
      padding: 8,
    },
    large: {
      iconSize: 28,
      padding: 10,
    },
  }

  return sizes[size]
}
