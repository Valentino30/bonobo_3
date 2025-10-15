/**
 * Central Theme Configuration
 * All colors and design tokens used across the app
 */

export const theme = {
  colors: {
    // Primary Brand Colors
    primary: '#6B8E5A',
    primaryDark: '#5C6B63',
    primaryLight: '#A5B89D',
    primaryLighter: '#D5E3CE',
    primaryAccent: '#4A5D42',

    // Background Colors
    background: '#FAFAFA',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundInput: '#F8F8F8',
    backgroundSecondary: '#F0F0F0',
    backgroundSuccess: '#E8F5E9',
    backgroundSuccessLight: '#F8FBF6',
    backgroundInfo: '#F5F9F3',
    backgroundDanger: '#FFF8F8',
    backgroundError: '#FFEBEE',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    backgroundLoading: '#F8F9FA',

    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#CCCCCC',
    textDark: '#333333',
    textWhite: '#FFFFFF',
    textPlaceholder: '#CCCCCC',
    textSuccess: '#2E7D32',
    textDanger: '#C62828',
    textError: '#C62828',
    textInfo: '#4A90E2',

    // Border Colors
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    borderSecondary: '#F0F0F0',
    borderFocus: '#D5E3CE',
    borderDanger: '#FFE0E0',
    borderInput: '#E0E0E0',
    borderDivider: '#ECECEC',

    // Shadow Colors
    shadow: '#000000',

    // Status Colors
    success: '#6B8E5A',
    successDark: '#2E7D32',
    error: '#C62828',
    errorLight: '#E57373',
    warning: '#FF6B6B',
    info: '#4A90E2',
    infoLight: '#7BA1D7',

    // Misc Colors
    darkOverlay: '#2C3E50',
  },

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
