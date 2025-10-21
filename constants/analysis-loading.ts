import i18n from '@/i18n/config'

export type LoadingStep = {
  title: string
  subtitle: string
  icon: 'message-processing' | 'chart-box' | 'brain'
}

/**
 * Loading steps shown during chat analysis
 * Each step displays for 1000ms with smooth transitions
 */
export const ANALYSIS_LOADING_STEPS: LoadingStep[] = [
  {
    title: i18n.t('analysis.loadingSteps.readingTitle'),
    subtitle: i18n.t('analysis.loadingSteps.readingSubtitle'),
    icon: 'message-processing',
  },
  {
    title: i18n.t('analysis.loadingSteps.calculatingTitle'),
    subtitle: i18n.t('analysis.loadingSteps.calculatingSubtitle'),
    icon: 'chart-box',
  },
  {
    title: i18n.t('analysis.loadingSteps.generatingTitle'),
    subtitle: i18n.t('analysis.loadingSteps.generatingSubtitle'),
    icon: 'brain',
  },
]
