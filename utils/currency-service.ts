import { getLocales, getCalendars } from 'expo-localization'
import * as SecureStore from 'expo-secure-store'

const CURRENCY_OVERRIDE_KEY = 'user_currency_override'
const EXCHANGE_RATES_KEY = 'exchange_rates_cache'
const EXCHANGE_RATES_TIMESTAMP_KEY = 'exchange_rates_timestamp'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Base pricing in USD
const BASE_PRICING_USD = {
  oneTime: 2.99,
  weekly: 4.99,
  monthly: 9.99,
}

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
}

// Fallback exchange rates (used if API fails)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.5,
  INR: 83.12,
  BRL: 5.0,
  MXN: 18.5,
}

// Currency pricing type
export interface CurrencyPricing {
  symbol: string
  code: string
  oneTime: number
  weekly: number
  monthly: number
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'BRL' | 'MXN'

// Helper function to calculate pricing for a currency
function calculatePricing(currency: string, rate: number): CurrencyPricing {
  const symbol = CURRENCY_SYMBOLS[currency] || '$'

  // For JPY and INR, round to whole numbers (no decimals)
  if (currency === 'JPY' || currency === 'INR') {
    return {
      symbol,
      code: currency,
      oneTime: Math.round(BASE_PRICING_USD.oneTime * rate),
      weekly: Math.round(BASE_PRICING_USD.weekly * rate),
      monthly: Math.round(BASE_PRICING_USD.monthly * rate),
    }
  }

  return {
    symbol,
    code: currency,
    oneTime: parseFloat((BASE_PRICING_USD.oneTime * rate).toFixed(2)),
    weekly: parseFloat((BASE_PRICING_USD.weekly * rate).toFixed(2)),
    monthly: parseFloat((BASE_PRICING_USD.monthly * rate).toFixed(2)),
  }
}

// Initialize CURRENCY_PRICING with fallback rates
const initCurrencyPricing = (): Record<string, CurrencyPricing> => {
  const pricing: Record<string, CurrencyPricing> = {}
  for (const [currency, rate] of Object.entries(FALLBACK_RATES)) {
    pricing[currency] = calculatePricing(currency, rate)
  }
  return pricing
}

export const CURRENCY_PRICING: Record<string, CurrencyPricing> = initCurrencyPricing()

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
   * Fetch live exchange rates from API
   */
  static async fetchExchangeRates(): Promise<Record<string, number> | null> {
    try {
      console.log('💱 Fetching live exchange rates...')
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.rates) {
        throw new Error('Invalid response format')
      }

      console.log('✅ Exchange rates fetched successfully')

      // Cache the rates
      await SecureStore.setItemAsync(EXCHANGE_RATES_KEY, JSON.stringify(data.rates))
      await SecureStore.setItemAsync(EXCHANGE_RATES_TIMESTAMP_KEY, Date.now().toString())

      return data.rates
    } catch (error) {
      console.error('❌ Failed to fetch exchange rates:', error)
      return null
    }
  }

  /**
   * Get cached exchange rates if still valid
   */
  static async getCachedExchangeRates(): Promise<Record<string, number> | null> {
    try {
      const timestamp = await SecureStore.getItemAsync(EXCHANGE_RATES_TIMESTAMP_KEY)

      if (!timestamp) {
        return null
      }

      const age = Date.now() - parseInt(timestamp, 10)

      // Check if cache is still valid (less than 24 hours old)
      if (age > CACHE_DURATION) {
        console.log('💱 Exchange rate cache expired')
        return null
      }

      const cachedRates = await SecureStore.getItemAsync(EXCHANGE_RATES_KEY)

      if (!cachedRates) {
        return null
      }

      console.log('✅ Using cached exchange rates')
      return JSON.parse(cachedRates)
    } catch (error) {
      console.error('❌ Failed to get cached rates:', error)
      return null
    }
  }

  /**
   * Get exchange rates (from cache or fetch new ones)
   */
  static async getExchangeRates(): Promise<Record<string, number>> {
    // Try to get cached rates first
    let rates = await this.getCachedExchangeRates()

    // If no valid cache, fetch new rates
    if (!rates) {
      rates = await this.fetchExchangeRates()
    }

    // If fetch failed, use fallback rates
    if (!rates) {
      console.log('⚠️ Using fallback exchange rates')
      return FALLBACK_RATES
    }

    return rates
  }

  /**
   * Update CURRENCY_PRICING with live rates
   */
  static async updatePricingWithLiveRates(): Promise<void> {
    try {
      const rates = await this.getExchangeRates()

      // Update CURRENCY_PRICING object
      for (const currency of Object.keys(FALLBACK_RATES)) {
        const rate = rates[currency] || FALLBACK_RATES[currency]
        CURRENCY_PRICING[currency] = calculatePricing(currency, rate)
      }

      console.log('💰 Pricing updated with live rates')
    } catch (error) {
      console.error('❌ Failed to update pricing:', error)
    }
  }

  /**
   * Set user's preferred currency (overrides automatic detection)
   */
  static async setCurrencyOverride(currency: SupportedCurrency): Promise<void> {
    try {
      await SecureStore.setItemAsync(CURRENCY_OVERRIDE_KEY, currency)
      console.log('💾 Currency override saved:', currency)
    } catch (error) {
      console.error('❌ Failed to save currency override:', error)
    }
  }

  /**
   * Get user's currency override preference
   */
  static async getCurrencyOverride(): Promise<SupportedCurrency | null> {
    try {
      const override = await SecureStore.getItemAsync(CURRENCY_OVERRIDE_KEY)
      if (override && this.isCurrencySupported(override)) {
        console.log('✅ Using currency override:', override)
        return override as SupportedCurrency
      }
      return null
    } catch (error) {
      console.error('❌ Failed to get currency override:', error)
      return null
    }
  }

  /**
   * Clear currency override (return to automatic detection)
   */
  static async clearCurrencyOverride(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CURRENCY_OVERRIDE_KEY)
      console.log('🗑️ Currency override cleared')
    } catch (error) {
      console.error('❌ Failed to clear currency override:', error)
    }
  }

  /**
   * Get the user's currency based on their device locale
   */
  static getUserCurrency(): SupportedCurrency {
    console.log('🌍 getUserCurrency() called')
    try {
      console.log('📍 Attempting to get locales...')
      const locales = getLocales()
      console.log('📍 Locales retrieved:', locales)

      // Try getCalendars to see if it provides region info
      try {
        const calendars = getCalendars()
        console.log('📅 Calendars retrieved:', calendars)
      } catch {
        console.log('📅 getCalendars not available or failed')
      }

      // Strategy: Use the device's currencyCode directly (most accurate for format settings)
      // The currencyCode reflects the actual currency format the device is set to use
      const primaryLocale = locales[0]
      if (primaryLocale?.currencyCode) {
        const deviceCurrency = primaryLocale.currencyCode as string
        console.log('💰 Device currency code:', deviceCurrency)

        // Check if we support this currency
        if (this.isCurrencySupported(deviceCurrency)) {
          console.log('✅ Using device currency:', deviceCurrency)
          return deviceCurrency as SupportedCurrency
        }

        console.log('⚠️ Device currency not supported:', deviceCurrency)
      }

      // Fallback: Use region code mapping
      const primaryRegion = primaryLocale?.regionCode || 'US'
      console.log('📍 Falling back to region code:', primaryRegion)

      const currency = REGION_TO_CURRENCY[primaryRegion]
      if (currency) {
        console.log('✅ Detected currency from region:', currency)
        return currency
      }

      // Final fallback to USD
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
