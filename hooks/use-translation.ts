import { useEffect, useState } from 'react'
import i18n, { subscribeToLocaleChange } from '@/i18n/config'

/**
 * Hook that provides translation function with automatic re-render on locale change
 *
 * @returns Object with translation function
 *
 * @example
 * const { t } = useTranslation()
 * return <Text>{t('common.hello')}</Text>
 */
export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale)

  useEffect(() => {
    const unsubscribe = subscribeToLocaleChange(() => {
      setLocale(i18n.locale)
    })

    return unsubscribe
  }, [])

  // Create a wrapper function that always uses the current i18n instance
  // This ensures fresh translations on every call
  const t = (key: string, params?: Record<string, any>) => {
    return i18n.t(key, params)
  }

  return {
    t,
    locale,
  }
}
