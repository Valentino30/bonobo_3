import { getLocales } from 'expo-localization'

// Supported currencies with their pricing
export const CURRENCY_PRICING = {
  USD: {
    symbol: '$',
    code: 'USD',
    oneTime: 2.99,
    weekly: 4.99,
    monthly: 9.99,
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    oneTime: 2.79,
    weekly: 4.69,
    monthly: 9.29,
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    oneTime: 2.39,
    weekly: 3.99,
    monthly: 7.99,
  },
  CAD: {
    symbol: 'CA$',
    code: 'CAD',
    oneTime: 3.99,
    weekly: 6.69,
    monthly: 12.99,
  },
  AUD: {
    symbol: 'A$',
    code: 'AUD',
    oneTime: 4.49,
    weekly: 7.49,
    monthly: 14.99,
  },
  JPY: {
    symbol: '¥',
    code: 'JPY',
    oneTime: 450,
    weekly: 750,
    monthly: 1450,
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    oneTime: 249,
    weekly: 399,
    monthly: 799,
  },
  BRL: {
    symbol: 'R$',
    code: 'BRL',
    oneTime: 14.99,
    weekly: 24.99,
    monthly: 49.99,
  },
  MXN: {
    symbol: 'MX$',
    code: 'MXN',
    oneTime: 54.99,
    weekly: 89.99,
    monthly: 179.99,
  },
} as const

export type SupportedCurrency = keyof typeof CURRENCY_PRICING

// Map locale regions to currencies
const REGION_TO_CURRENCY: Record<string, SupportedCurrency> = {
  // North America
  US: 'USD',
  CA: 'CAD',
  MX: 'MXN',

  // Europe
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  CY: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',

  // Asia Pacific
  AU: 'AUD',
  NZ: 'AUD',
  JP: 'JPY',
  IN: 'INR',

  // South America
  BR: 'BRL',
  AR: 'BRL',
  CL: 'BRL',
  CO: 'BRL',
  PE: 'BRL',
}

export class CurrencyService {
  /**
   * Get the user's currency based on their device locale
   */
  static getUserCurrency(): SupportedCurrency {
    console.log('🌍 getUserCurrency() called')
    try {
      console.log('📍 Attempting to get locales...')
      // Get the device region code (e.g., 'US', 'GB', 'DE')
      const locales = getLocales()
      console.log('📍 Locales retrieved:', locales)

      // Use the primary (first) locale's region code
      const regionCode = locales[0]?.regionCode || 'US'

      console.log('📍 Primary region code:', regionCode)

      // Look up currency for this region
      const currency = REGION_TO_CURRENCY[regionCode]

      if (currency) {
        console.log('✅ Detected currency:', currency)
        return currency
      }

      // Fallback to USD if region not found
      console.log('⚠️ Region not found in mapping, defaulting to USD')
      return 'USD'
    } catch (error) {
      console.error('❌ Error detecting currency, defaulting to USD:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return 'USD'
    }
  }

  /**
   * Get pricing for a specific currency
   */
  static getPricing(currency: SupportedCurrency) {
    return CURRENCY_PRICING[currency]
  }

  /**
   * Format a price with currency symbol
   */
  static formatPrice(amount: number, currency: SupportedCurrency): string {
    const { symbol, code } = CURRENCY_PRICING[currency]

    // Special formatting for JPY and INR (no decimals)
    if (code === 'JPY' || code === 'INR') {
      return `${symbol}${Math.round(amount)}`
    }

    // Standard formatting with 2 decimals
    return `${symbol}${amount.toFixed(2)}`
  }

  /**
   * Get all supported currencies
   */
  static getSupportedCurrencies(): SupportedCurrency[] {
    return Object.keys(CURRENCY_PRICING) as SupportedCurrency[]
  }

  /**
   * Check if a currency is supported
   */
  static isCurrencySupported(currency: string): currency is SupportedCurrency {
    return currency in CURRENCY_PRICING
  }
}
