import { getLocales } from 'expo-localization'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '@/services/supabase'

// Storage key for user preference (only thing we persist)
const CURRENCY_OVERRIDE_KEY = 'user_currency_override'

// Base currency - Always charge in EUR (EU company)
export const CHARGE_CURRENCY = 'EUR' as const

// Base pricing in EUR (fetched from Stripe, with fallback values)
// NOTE: Users are ALWAYS charged in EUR regardless of display currency
let BASE_PRICING_EUR = {
  oneTime: 2.99,
  weekly: 4.99,
  monthly: 9.99,
}

// Fallback exchange rates for DISPLAY purposes only (relative to EUR)
// Used if live API fetch fails
const FALLBACK_DISPLAY_RATES: Record<string, number> = {
  EUR: 1,      // Base currency
  USD: 1.08,   // 1 EUR = 1.08 USD
  GBP: 0.85,   // 1 EUR = 0.85 GBP
  CAD: 1.46,   // 1 EUR = 1.46 CAD
  AUD: 1.63,   // 1 EUR = 1.63 AUD
  JPY: 160.76, // 1 EUR = 160.76 JPY
  INR: 89.36,  // 1 EUR = 89.36 INR
  BRL: 5.38,   // 1 EUR = 5.38 BRL
  MXN: 19.89,  // 1 EUR = 19.89 MXN
}

// Live exchange rates (cached in-memory for 1 hour)
let cachedExchangeRates: Record<string, number> | null = null
let lastFetchTime = 0
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

// Types
export type SupportedCurrency = keyof typeof FALLBACK_DISPLAY_RATES

export interface CurrencyPricing {
  code: string
  oneTime: number
  weekly: number
  monthly: number
}

/**
 * Fetches live exchange rates from API (cached for 1 hour)
 * Returns live rates or fallback rates if fetch fails
 */
async function getExchangeRates(): Promise<Record<string, number>> {
  // Check cache first
  const now = Date.now()
  if (cachedExchangeRates && now - lastFetchTime < CACHE_DURATION_MS) {
    return cachedExchangeRates
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
    if (!response.ok) {
      return FALLBACK_DISPLAY_RATES
    }

    const data = await response.json()
    if (!data.rates) {
      return FALLBACK_DISPLAY_RATES
    }

    // Update cache
    cachedExchangeRates = data.rates
    lastFetchTime = now

    console.log('Exchange rates updated from API')
    return data.rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return FALLBACK_DISPLAY_RATES
  }
}

/**
 * Fetches base prices from Stripe via Supabase Edge Function
 * This ensures pricing comes from the single source of truth (Stripe)
 * Call this on app startup
 */
export async function fetchBasePricesFromStripe(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stripe-prices')

    if (error) {
      console.error('Failed to fetch Stripe prices:', error)
      return
    }

    if (data && typeof data === 'object') {
      // Update base pricing with values from Stripe (in EUR)
      if (data.oneTime) BASE_PRICING_EUR.oneTime = data.oneTime
      if (data.weekly) BASE_PRICING_EUR.weekly = data.weekly
      if (data.monthly) BASE_PRICING_EUR.monthly = data.monthly

      console.log('Base prices updated from Stripe (EUR):', BASE_PRICING_EUR)
    }
  } catch (error) {
    console.error('Error fetching base prices from Stripe:', error)
  }
}

/**
 * Sets user's preferred currency
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
 * Clears currency override
 */
export async function clearCurrencyOverride(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CURRENCY_OVERRIDE_KEY)
  } catch (error) {
    console.error('Failed to clear currency override:', error)
  }
}

/**
 * Gets user's currency based on device locale
 */
export function getUserCurrency(): SupportedCurrency {
  try {
    const locales = getLocales()
    const primaryLocale = locales[0]

    // Try currency code from device
    if (primaryLocale?.currencyCode && isCurrencySupported(primaryLocale.currencyCode)) {
      return primaryLocale.currencyCode as SupportedCurrency
    }

    return 'USD'
  } catch (error) {
    console.error('Error detecting currency:', error)
    return 'USD'
  }
}

/**
 * Gets pricing for a currency (for display purposes)
 * Calculates prices on-the-fly by converting from EUR base pricing using live exchange rates
 */
export async function getPricing(currency: SupportedCurrency): Promise<CurrencyPricing> {
  const rates = await getExchangeRates()
  const rate = rates[currency] || FALLBACK_DISPLAY_RATES[currency]

  return {
    code: currency,
    oneTime: parseFloat((BASE_PRICING_EUR.oneTime * rate).toFixed(2)),
    weekly: parseFloat((BASE_PRICING_EUR.weekly * rate).toFixed(2)),
    monthly: parseFloat((BASE_PRICING_EUR.monthly * rate).toFixed(2)),
  }
}

/**
 * Gets the actual EUR price that will be charged (regardless of display currency)
 * Always use this when creating payment intents
 */
export function getChargePrice(planType: 'oneTime' | 'weekly' | 'monthly'): { amount: number; currency: string } {
  return {
    amount: BASE_PRICING_EUR[planType],
    currency: CHARGE_CURRENCY,
  }
}

/**
 * Gets the currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    // Format 0 and extract just the symbol by removing digits
    return formatter.format(0).replace(/\d/g, '').trim()
  } catch {
    return currency
  }
}

/**
 * Formats price with currency symbol using Intl.NumberFormat
 */
export function formatPrice(amount: number, currency: SupportedCurrency): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'INR' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'INR' ? 0 : 2,
    })
    return formatter.format(amount)
  } catch {
    // Fallback if Intl fails
    return `${amount.toFixed(2)} ${currency}`
  }
}

/**
 * Gets all supported currencies
 */
export function getSupportedCurrencies(): SupportedCurrency[] {
  return Object.keys(FALLBACK_DISPLAY_RATES) as SupportedCurrency[]
}

/**
 * Checks if a currency is supported
 */
export function isCurrencySupported(currency: string): currency is SupportedCurrency {
  return currency in FALLBACK_DISPLAY_RATES
}
