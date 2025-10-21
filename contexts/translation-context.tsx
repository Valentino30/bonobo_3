import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import i18n, { subscribeToLocaleChange } from '@/i18n/config'

interface TranslationContextType {
  locale: string
  t: (key: string, params?: Record<string, any>) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(i18n.locale)

  useEffect(() => {
    // Subscribe to locale changes
    const unsubscribe = subscribeToLocaleChange(() => {
      setLocale(i18n.locale)
    })

    return unsubscribe
  }, [])

  // Translation function that always uses current locale
  // useCallback ensures this function reference is stable
  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      return i18n.t(key, params)
    },
    [locale]
  ) // Recreate when locale changes

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ locale, t }), [locale, t])

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
