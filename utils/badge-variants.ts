import { type Theme } from '@/constants/theme'

export type VariantType = 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'

export interface VariantStyleOverrides {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  iconColor?: string
  titleColor?: string
}

export interface VariantStyle {
  backgroundColor: string
  borderColor: string
  textColor: string
  iconColor: string
  titleColor?: string
}

/**
 * Get consistent variant styles for UI components (badges, banners, cards)
 * Supports custom overrides for each color property
 */
export function getVariantStyles(theme: Theme, variant: VariantType, overrides?: VariantStyleOverrides): VariantStyle {
  const baseStyles: Record<VariantType, VariantStyle> = {
    default: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderColor: theme.colors.border,
      textColor: theme.colors.text,
      iconColor: theme.colors.text,
      titleColor: theme.colors.text,
    },
    info: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      textColor: theme.colors.primaryDark,
      iconColor: theme.colors.primary,
      titleColor: theme.colors.primary,
    },
    primary: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      textColor: theme.colors.primary,
      iconColor: theme.colors.primary,
      titleColor: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.backgroundSuccess,
      borderColor: theme.colors.primaryLighter,
      textColor: theme.colors.successDark,
      iconColor: theme.colors.successDark,
      titleColor: theme.colors.successDark,
    },
    warning: {
      backgroundColor: theme.colors.backgroundInfo,
      borderColor: theme.colors.primaryLighter,
      textColor: theme.colors.textSecondary,
      iconColor: theme.colors.warning,
      titleColor: theme.colors.warning,
    },
    error: {
      backgroundColor: theme.colors.backgroundError,
      borderColor: theme.colors.errorLight,
      textColor: theme.colors.textError,
      iconColor: theme.colors.error,
      titleColor: theme.colors.error,
    },
  }

  const baseStyle = baseStyles[variant]

  // Apply overrides
  return {
    backgroundColor: overrides?.backgroundColor || baseStyle.backgroundColor,
    borderColor: overrides?.borderColor || baseStyle.borderColor,
    textColor: overrides?.textColor || baseStyle.textColor,
    iconColor: overrides?.iconColor || baseStyle.iconColor,
    titleColor: overrides?.titleColor || baseStyle.titleColor,
  }
}
