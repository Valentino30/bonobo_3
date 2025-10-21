import { useContext } from 'react'
import { TranslationContext } from '@/contexts/translation-context'

/**
 * Hook that provides translation function with automatic re-render on locale change
 *
 * @returns Object with translation function and current locale
 *
 * @example
 * const { t, locale } = useTranslation()
 * return <Text>{t('common.hello')}</Text>
 */
export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
