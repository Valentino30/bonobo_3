import { getLocales } from 'expo-localization'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '@/services/supabase'

// Storage key for user preference (only thing we persist)
const CURRENCY_OVERRIDE_KEY = 'user_currency_override'

// Base currency - Always charge in EUR (EU company)
export const CHARGE_CURRENCY = 'EUR' as const

// Fallback base pricing in EUR (used if Stripe fetch fails)
// NOTE: Users are ALWAYS charged in EUR regardless of display currency
const FALLBACK_BASE_PRICING_EUR = {
  oneTime: 2.99,
  weekly: 4.99,
  monthly: 9.99,
}

// Current base pricing (will be fetched from Stripe via Edge Function)
let BASE_PRICING_EUR = { ...FALLBACK_BASE_PRICING_EUR }

// Exchange rates for DISPLAY purposes only (relative to EUR)
// Users see converted prices but are always charged in EUR
const FALLBACK_RATES: Record<string, number> = {
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

// Types
export type SupportedCurrency = keyof typeof FALLBACK_RATES

export interface CurrencyPricing {
  code: string
  oneTime: number
  weekly: number
  monthly: number
}

// Initialize pricing with fallback rates
let CURRENCY_PRICING: Record<string, CurrencyPricing> = {}

function initializePricing() {
  for (const [currency, rate] of Object.entries(FALLBACK_RATES)) {
    CURRENCY_PRICING[currency] = {
      code: currency,
      oneTime: parseFloat((BASE_PRICING_EUR.oneTime * rate).toFixed(2)),
      weekly: parseFloat((BASE_PRICING_EUR.weekly * rate).toFixed(2)),
      monthly: parseFloat((BASE_PRICING_EUR.monthly * rate).toFixed(2)),
    }
  }
}

initializePricing()

/**
 * Fetches base prices from Stripe via Supabase Edge Function
 * This ensures pricing comes from the single source of truth (Stripe)
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
      BASE_PRICING_EUR = {
        oneTime: data.oneTime || FALLBACK_BASE_PRICING_EUR.oneTime,
        weekly: data.weekly || FALLBACK_BASE_PRICING_EUR.weekly,
        monthly: data.monthly || FALLBACK_BASE_PRICING_EUR.monthly,
      }

      // Reinitialize all currency pricing with new base prices
      initializePricing()

      console.log('Base prices updated from Stripe (EUR):', BASE_PRICING_EUR)
    }
  } catch (error) {
    console.error('Error fetching base prices from Stripe:', error)
  }
}

/**
 * Fetches live exchange rates from API (based on EUR)
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
    if (!response.ok) return FALLBACK_RATES

    const data = await response.json()
    if (!data.rates) return FALLBACK_RATES

    return data.rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return FALLBACK_RATES
  }
}

/**
 * Updates pricing with live data from Stripe and exchange rates
 * Call this on app startup to get fresh pricing from Stripe
 */
export async function updatePricingWithLiveRates(): Promise<void> {
  try {
    // Fetch base prices from Stripe first (single source of truth)
    await fetchBasePricesFromStripe()

    // Then fetch exchange rates to convert to other currencies
    const rates = await fetchExchangeRates()

    for (const currency of Object.keys(FALLBACK_RATES)) {
      const rate = rates[currency] || FALLBACK_RATES[currency]
      CURRENCY_PRICING[currency] = {
        code: currency,
        oneTime: parseFloat((BASE_PRICING_EUR.oneTime * rate).toFixed(2)),
        weekly: parseFloat((BASE_PRICING_EUR.weekly * rate).toFixed(2)),
        monthly: parseFloat((BASE_PRICING_EUR.monthly * rate).toFixed(2)),
      }
    }
  } catch (error) {
    console.error('Failed to update pricing:', error)
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
 */
export function getPricing(currency: SupportedCurrency): CurrencyPricing {
  return CURRENCY_PRICING[currency]
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
  return Object.keys(FALLBACK_RATES) as SupportedCurrency[]
}

/**
 * Checks if a currency is supported
 */
export function isCurrencySupported(currency: string): currency is SupportedCurrency {
  return currency in FALLBACK_RATES
}
