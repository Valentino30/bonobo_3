import React, { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react'
import i18n, { setLocale as setI18nLocale, subscribeToLocaleChange } from '@/i18n/config'

export interface TranslationContextType {
  locale: string
  t: (key: string, params?: Record<string, any>) => string
  changeLanguage: (locale: string) => void
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(i18n.locale)

  useEffect(() => {
    // Subscribe to locale changes
    const unsubscribe = subscribeToLocaleChange(() => {
      setLocale(i18n.locale)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Translation function - recreated when locale changes to force re-renders
  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      return i18n.t(key, params)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  )

  // Change language function
  const changeLanguage = useCallback((newLocale: string) => {
    setI18nLocale(newLocale)
  }, [])

  // Memoize the context value - it updates when locale changes
  const value = useMemo(() => ({ locale, t, changeLanguage }), [locale, t, changeLanguage])

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
