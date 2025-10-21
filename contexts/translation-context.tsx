import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'
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
  const t = (key: string, params?: Record<string, any>) => {
    return i18n.t(key, params)
  }

  return <TranslationContext.Provider value={{ locale, t }}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
