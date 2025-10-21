import { Platform } from 'react-native'
import { Step } from '@/components/step-list'
import i18n from '@/i18n/config'

const isIOS = Platform.OS === 'ios'

export const IMPORT_GUIDE_STEPS: Step[] = [
  {
    title: i18n.t('importGuide.steps.step1Title'),
    description: i18n.t('importGuide.steps.step1Description'),
  },
  {
    title: i18n.t('importGuide.steps.step2Title'),
    description: i18n.t('importGuide.steps.step2Description'),
  },
  {
    title: isIOS ? i18n.t('importGuide.steps.step3TitleIOS') : i18n.t('importGuide.steps.step3TitleAndroid'),
    description: isIOS
      ? i18n.t('importGuide.steps.step3DescriptionIOS')
      : i18n.t('importGuide.steps.step3DescriptionAndroid'),
  },
  {
    title: i18n.t('importGuide.steps.step4Title'),
    description: i18n.t('importGuide.steps.step4Description'),
  },
  {
    title: i18n.t('importGuide.steps.step5Title'),
    description: i18n.t('importGuide.steps.step5Description'),
  },
]
