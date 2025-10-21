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
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToLocaleChange(() => {
      forceUpdate((prev) => prev + 1)
    })

    return unsubscribe
  }, [])

  return {
    t: i18n.t.bind(i18n),
    locale: i18n.locale,
  }
}
