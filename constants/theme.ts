/**
 * Central Theme Configuration
 * All colors and design tokens used across the app
 */

import { defaultPalette } from './color-palettes'

export const theme = {
  colors: defaultPalette.colors,

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },

  fontSize: {
    xs: 12,
    sm: 13,
    md: 14,
    base: 15,
    lg: 16,
    xl: 18,
    xxl: 20,
    title: 28,
    largeTitle: 32,
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  opacity: {
    disabled: 0.5,
    pressed: 0.6,
    overlay: 0.5,
    shadow: 0.1,
  },

  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
} as const

export type Theme = typeof theme
export type ThemeColors = typeof theme.colors

// Legacy export for backward compatibility
const tintColorLight = theme.colors.primary
const tintColorDark = '#fff'

export const Colors = {
  light: {
    text: theme.colors.text,
    background: theme.colors.background,
    tint: tintColorLight,
    icon: theme.colors.primary,
    tabIconDefault: theme.colors.primaryLight,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
}

export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
}
