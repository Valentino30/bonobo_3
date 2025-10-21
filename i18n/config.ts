import { getLocales } from 'expo-localization'
import { I18n } from 'i18n-js'
import en from './locales/en.json'
import it from './locales/it.json'

// Create i18n instance
const i18n = new I18n({
  en,
  it,
})

// Get device locale (getLocales returns an array, we use the first one)
const deviceLanguageCode = getLocales()[0]?.languageCode

// Determine locale: if Italian, use Italian; otherwise default to English
const selectedLocale = deviceLanguageCode === 'it' ? 'it' : 'en'

// Set the locale based on device settings
i18n.locale = selectedLocale
i18n.enableFallback = true
i18n.defaultLocale = 'en'

// Helper function to get current locale
export const getCurrentLocale = (): string => {
  return i18n.locale
}

// Helper function to change locale
export const setLocale = (locale: string) => {
  i18n.locale = locale
}

// Export the configured i18n instance
export default i18n
