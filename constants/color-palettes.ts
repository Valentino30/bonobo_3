/**
 * Color Palette Definitions
 * Multiple themed color palettes for the app
 */

export type ColorPalette = {
  id: string;
  name: string;
  colors: {
    // Primary Brand Colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    primaryLighter: string;
    primaryAccent: string;

    // Background Colors
    background: string;
    backgroundLight: string;
    backgroundCard: string;
    backgroundInput: string;
    backgroundSecondary: string;
    backgroundSuccess: string;
    backgroundSuccessLight: string;
    backgroundInfo: string;
    backgroundDanger: string;
    backgroundError: string;
    backgroundOverlay: string;
    backgroundLoading: string;

    // Text Colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textLight: string;
    textDark: string;
    textWhite: string;
    textPlaceholder: string;
    textSuccess: string;
    textDanger: string;
    textError: string;
    textInfo: string;

    // Border Colors
    border: string;
    borderLight: string;
    borderSecondary: string;
    borderFocus: string;
    borderDanger: string;
    borderInput: string;
    borderDivider: string;

    // Shadow Colors
    shadow: string;

    // Status Colors
    success: string;
    successDark: string;
    error: string;
    errorLight: string;
    warning: string;
    info: string;
    infoLight: string;

    // Misc Colors
    darkOverlay: string;
  };
};

// Matcha Green (Original)
export const matchaGreen: ColorPalette = {
  id: 'matcha',
  name: 'Matcha Green',
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
};

// Deep Teal
export const deepTeal: ColorPalette = {
  id: 'teal',
  name: 'Deep Teal',
  colors: {
    // Primary Brand Colors
    primary: '#0091AA',
    primaryDark: '#006F85',
    primaryLight: '#33ABC0',
    primaryLighter: '#CCE9EF',
    primaryAccent: '#005566',

    // Background Colors
    background: '#F9FCFD',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundInput: '#F5FAFB',
    backgroundSecondary: '#EBF6F8',
    backgroundSuccess: '#E8F6F8',
    backgroundSuccessLight: '#F7FCFD',
    backgroundInfo: '#F2F9FA',
    backgroundDanger: '#FFF8F8',
    backgroundError: '#FFEBEE',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    backgroundLoading: '#F7FBFC',

    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#CCCCCC',
    textDark: '#333333',
    textWhite: '#FFFFFF',
    textPlaceholder: '#CCCCCC',
    textSuccess: '#005566',
    textDanger: '#C62828',
    textError: '#C62828',
    textInfo: '#006F85',

    // Border Colors
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    borderSecondary: '#F0F0F0',
    borderFocus: '#CCE9EF',
    borderDanger: '#FFE0E0',
    borderInput: '#E0E0E0',
    borderDivider: '#ECECEC',

    // Shadow Colors
    shadow: '#000000',

    // Status Colors
    success: '#0091AA',
    successDark: '#005566',
    error: '#C62828',
    errorLight: '#E57373',
    warning: '#FF6B6B',
    info: '#006F85',
    infoLight: '#33ABC0',

    // Misc Colors
    darkOverlay: '#2C4A54',
  },
};

// Soft Lavender
export const softLavender: ColorPalette = {
  id: 'lavender',
  name: 'Soft Lavender',
  colors: {
    // Primary Brand Colors
    primary: '#B6B6E0',
    primaryDark: '#9494C7',
    primaryLight: '#D4D4EC',
    primaryLighter: '#EEEEF8',
    primaryAccent: '#7C7CB3',

    // Background Colors
    background: '#FAF9FC',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundInput: '#F8F7FB',
    backgroundSecondary: '#F2F0F7',
    backgroundSuccess: '#F3EFF8',
    backgroundSuccessLight: '#FDFCFE',
    backgroundInfo: '#F7F5FA',
    backgroundDanger: '#FFF8F8',
    backgroundError: '#FFEBEE',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    backgroundLoading: '#F9F8FB',

    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#CCCCCC',
    textDark: '#333333',
    textWhite: '#FFFFFF',
    textPlaceholder: '#CCCCCC',
    textSuccess: '#7C7CB3',
    textDanger: '#C62828',
    textError: '#C62828',
    textInfo: '#9494C7',

    // Border Colors
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    borderSecondary: '#F0F0F0',
    borderFocus: '#EEEEF8',
    borderDanger: '#FFE0E0',
    borderInput: '#E0E0E0',
    borderDivider: '#ECECEC',

    // Shadow Colors
    shadow: '#000000',

    // Status Colors
    success: '#B6B6E0',
    successDark: '#7C7CB3',
    error: '#C62828',
    errorLight: '#E57373',
    warning: '#FF6B6B',
    info: '#9494C7',
    infoLight: '#D4D4EC',

    // Misc Colors
    darkOverlay: '#4A3F5C',
  },
};

// Sage Green
export const sageGreen: ColorPalette = {
  id: 'sage',
  name: 'Sage Green',
  colors: {
    // Primary Brand Colors
    primary: '#84A98C',
    primaryDark: '#6B8A73',
    primaryLight: '#A8C4AE',
    primaryLighter: '#DCE8DF',
    primaryAccent: '#5A7563',

    // Background Colors
    background: '#FAFBFA',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundInput: '#F7F9F8',
    backgroundSecondary: '#F0F3F1',
    backgroundSuccess: '#EFF5F1',
    backgroundSuccessLight: '#F9FBF9',
    backgroundInfo: '#F4F8F5',
    backgroundDanger: '#FFF8F8',
    backgroundError: '#FFEBEE',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    backgroundLoading: '#F8FAF9',

    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#CCCCCC',
    textDark: '#333333',
    textWhite: '#FFFFFF',
    textPlaceholder: '#CCCCCC',
    textSuccess: '#5A7563',
    textDanger: '#C62828',
    textError: '#C62828',
    textInfo: '#6B8A73',

    // Border Colors
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    borderSecondary: '#F0F0F0',
    borderFocus: '#DCE8DF',
    borderDanger: '#FFE0E0',
    borderInput: '#E0E0E0',
    borderDivider: '#ECECEC',

    // Shadow Colors
    shadow: '#000000',

    // Status Colors
    success: '#84A98C',
    successDark: '#5A7563',
    error: '#C62828',
    errorLight: '#E57373',
    warning: '#FF6B6B',
    info: '#6B8A73',
    infoLight: '#A8C4AE',

    // Misc Colors
    darkOverlay: '#3A4D3F',
  },
};

// Powder Blue
export const powderBlue: ColorPalette = {
  id: 'powder',
  name: 'Powder Blue',
  colors: {
    // Primary Brand Colors
    primary: '#B0D7E7',
    primaryDark: '#8EBFD4',
    primaryLight: '#D0E7F2',
    primaryLighter: '#EEF7FB',
    primaryAccent: '#6FA7BF',

    // Background Colors
    background: '#F9FCFD',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundInput: '#F5FAFC',
    backgroundSecondary: '#EBF5F9',
    backgroundSuccess: '#EEF6F9',
    backgroundSuccessLight: '#F9FCFD',
    backgroundInfo: '#F3F9FB',
    backgroundDanger: '#FFF8F8',
    backgroundError: '#FFEBEE',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    backgroundLoading: '#F7FBFC',

    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#CCCCCC',
    textDark: '#333333',
    textWhite: '#FFFFFF',
    textPlaceholder: '#CCCCCC',
    textSuccess: '#6FA7BF',
    textDanger: '#C62828',
    textError: '#C62828',
    textInfo: '#8EBFD4',

    // Border Colors
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    borderSecondary: '#F0F0F0',
    borderFocus: '#EEF7FB',
    borderDanger: '#FFE0E0',
    borderInput: '#E0E0E0',
    borderDivider: '#ECECEC',

    // Shadow Colors
    shadow: '#000000',

    // Status Colors
    success: '#B0D7E7',
    successDark: '#6FA7BF',
    error: '#C62828',
    errorLight: '#E57373',
    warning: '#FF6B6B',
    info: '#8EBFD4',
    infoLight: '#D0E7F2',

    // Misc Colors
    darkOverlay: '#3F5460',
  },
};

// Misty Blue
export const mistyBlue: ColorPalette = {
  id: 'misty',
  name: 'Misty Blue',
  colors: {
    // Primary Brand Colors
    primary: '#A9C2C2',
    primaryDark: '#88A3A3',
    primaryLight: '#C7D9D9',
    primaryLighter: '#EAEFEF',
    primaryAccent: '#6F8787',

    // Background Colors
    background: '#FAFBFB',
    backgroundLight: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundInput: '#F7F9F9',
    backgroundSecondary: '#F0F3F3',
    backgroundSuccess: '#EFF3F3',
    backgroundSuccessLight: '#F9FBFB',
    backgroundInfo: '#F4F7F7',
    backgroundDanger: '#FFF8F8',
    backgroundError: '#FFEBEE',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    backgroundLoading: '#F8FAFA',

    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#CCCCCC',
    textDark: '#333333',
    textWhite: '#FFFFFF',
    textPlaceholder: '#CCCCCC',
    textSuccess: '#6F8787',
    textDanger: '#C62828',
    textError: '#C62828',
    textInfo: '#88A3A3',

    // Border Colors
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    borderSecondary: '#F0F0F0',
    borderFocus: '#EAEFEF',
    borderDanger: '#FFE0E0',
    borderInput: '#E0E0E0',
    borderDivider: '#ECECEC',

    // Shadow Colors
    shadow: '#000000',

    // Status Colors
    success: '#A9C2C2',
    successDark: '#6F8787',
    error: '#C62828',
    errorLight: '#E57373',
    warning: '#FF6B6B',
    info: '#88A3A3',
    infoLight: '#C7D9D9',

    // Misc Colors
    darkOverlay: '#3F4D4D',
  },
};

// Export all palettes
export const colorPalettes: ColorPalette[] = [
  matchaGreen,
  deepTeal,
  softLavender,
  sageGreen,
  powderBlue,
  mistyBlue,
];

// Default palette
export const defaultPalette = matchaGreen;
