import * as SecureStore from 'expo-secure-store'
import { getLocales } from 'expo-localization'

// Storage keys
const CURRENCY_OVERRIDE_KEY = 'user_currency_override'
const EXCHANGE_RATES_KEY = 'exchange_rates_cache'
const EXCHANGE_RATES_TIMESTAMP_KEY = 'exchange_rates_timestamp'

// Cache duration for exchange rates (24 hours)
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000

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

// Types
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
    const pricing: CurrencyPricing = {
      symbol,
      code: currency,
      oneTime: Math.round(BASE_PRICING_USD.oneTime * rate),
      weekly: Math.round(BASE_PRICING_USD.weekly * rate),
      monthly: Math.round(BASE_PRICING_USD.monthly * rate),
    }
    return pricing
  }

  const pricing: CurrencyPricing = {
    symbol,
    code: currency,
    oneTime: parseFloat((BASE_PRICING_USD.oneTime * rate).toFixed(2)),
    weekly: parseFloat((BASE_PRICING_USD.weekly * rate).toFixed(2)),
    monthly: parseFloat((BASE_PRICING_USD.monthly * rate).toFixed(2)),
  }
  return pricing
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

/**
 * Fetches live exchange rates from API
 */
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.rates) {
      throw new Error('Invalid response format')
    }

    // Cache the rates
    await SecureStore.setItemAsync(EXCHANGE_RATES_KEY, JSON.stringify(data.rates))
    await SecureStore.setItemAsync(EXCHANGE_RATES_TIMESTAMP_KEY, Date.now().toString())

    return data.rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return null
  }
}

/**
 * Gets cached exchange rates if still valid
 */
export async function getCachedExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const timestamp = await SecureStore.getItemAsync(EXCHANGE_RATES_TIMESTAMP_KEY)

    if (!timestamp) {
      return null
    }

    const cacheAge = Date.now() - parseInt(timestamp, 10)

    // Check if cache is still valid (less than 24 hours old)
    if (cacheAge > CACHE_DURATION_MS) {
      return null
    }

    const cachedRates = await SecureStore.getItemAsync(EXCHANGE_RATES_KEY)

    if (!cachedRates) {
      return null
    }

    const exchangeRates = JSON.parse(cachedRates)
    return exchangeRates
  } catch (error) {
    console.error('Failed to get cached rates:', error)
    return null
  }
}

/**
 * Gets exchange rates (from cache or fetch new ones)
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  // Try to get cached rates first
  let rates = await getCachedExchangeRates()

  // If no valid cache, fetch new rates
  if (!rates) {
    rates = await fetchExchangeRates()
  }

  // If fetch failed, use fallback rates
  if (!rates) {
    return FALLBACK_RATES
  }

  return rates
}

/**
 * Updates CURRENCY_PRICING with live rates
 */
export async function updatePricingWithLiveRates(): Promise<void> {
  try {
    const rates = await getExchangeRates()

    // Update CURRENCY_PRICING object
    for (const currency of Object.keys(FALLBACK_RATES)) {
      const rate = rates[currency] || FALLBACK_RATES[currency]
      CURRENCY_PRICING[currency] = calculatePricing(currency, rate)
    }
  } catch (error) {
    console.error('Failed to update pricing:', error)
  }
}

/**
 * Sets user's preferred currency (overrides automatic detection)
 */
export async function setCurrencyOverride(currency: SupportedCurrency): Promise<void> {
  try {
    await SecureStore.setItemAsync(CURRENCY_OVERRIDE_KEY, currency)
  } catch (error) {
    console.error('Failed to save currency override:', error)
  }
}

/**
 * Gets user's currency override preference
 */
export async function getCurrencyOverride(): Promise<SupportedCurrency | null> {
  try {
    const override = await SecureStore.getItemAsync(CURRENCY_OVERRIDE_KEY)
    if (override && isCurrencySupported(override)) {
      return override as SupportedCurrency
    }
    return null
  } catch (error) {
    console.error('Failed to get currency override:', error)
    return null
  }
}

/**
 * Clears currency override (return to automatic detection)
 */
export async function clearCurrencyOverride(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CURRENCY_OVERRIDE_KEY)
  } catch (error) {
    console.error('Failed to clear currency override:', error)
  }
}

/**
 * Gets the user's currency based on their device locale
 */
export function getUserCurrency(): SupportedCurrency {
  try {
    const locales = getLocales()

    // Use the device's currencyCode directly (most accurate for format settings)
    const primaryLocale = locales[0]
    if (primaryLocale?.currencyCode) {
      const deviceCurrency = primaryLocale.currencyCode as string

      // Check if we support this currency
      if (isCurrencySupported(deviceCurrency)) {
        return deviceCurrency as SupportedCurrency
      }
    }

    // Fallback: Use region code mapping
    const primaryRegion = primaryLocale?.regionCode || 'US'
    const currency = REGION_TO_CURRENCY[primaryRegion]

    if (currency) {
      return currency
    }

    // Final fallback to USD
    return 'USD'
  } catch (error) {
    console.error('Error detecting currency, defaulting to USD:', error)
    return 'USD'
  }
}

/**
 * Gets pricing for a specific currency
 */
export function getPricing(currency: SupportedCurrency): CurrencyPricing {
  return CURRENCY_PRICING[currency]
}

/**
 * Formats a price with currency symbol
 */
export function formatPrice(amount: number, currency: SupportedCurrency): string {
  const { symbol, code } = CURRENCY_PRICING[currency]

  // Special formatting for JPY and INR (no decimals)
  if (code === 'JPY' || code === 'INR') {
    const formattedPrice = `${symbol}${Math.round(amount)}`
    return formattedPrice
  }

  // Standard formatting with 2 decimals
  const formattedPrice = `${symbol}${amount.toFixed(2)}`
  return formattedPrice
}

/**
 * Gets all supported currencies
 */
export function getSupportedCurrencies(): SupportedCurrency[] {
  const currencies = Object.keys(CURRENCY_PRICING) as SupportedCurrency[]
  return currencies
}

/**
 * Checks if a currency is supported
 */
export function isCurrencySupported(currency: string): currency is SupportedCurrency {
  const isSupported = currency in CURRENCY_PRICING
  return isSupported
}
