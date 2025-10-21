import React, { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react'
import i18n, { subscribeToLocaleChange } from '@/i18n/config'

export interface TranslationContextType {
  locale: string
  t: (key: string, params?: Record<string, any>) => string
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

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
