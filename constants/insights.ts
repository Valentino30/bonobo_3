import i18n from '@/i18n/config'
import { type AIInsights } from '@/services/analysis-service'

export type InsightBadge = {
  text: string
  colorKey: 'error' | 'success' | 'primary' | 'info' | 'warning'
}

export type InsightConfig = {
  id: keyof AIInsights
  icon: string
  title: string
  unlockText: string
  explanationTitle: string
  explanationText: string
  /**
   * Extracts the badge configuration for this insight
   */
  getBadge: (insights: AIInsights, getFrequencyLabel: (count: number) => string) => InsightBadge
  /**
   * Extracts the items array for this insight (handles different property names like 'items' vs 'tips')
   */
  getItems: (insights: AIInsights) => string[]
}

/**
 * Configuration for all AI-powered insights
 * Each insight includes metadata for display and educational explanations
 * Returns fresh translations on each call to support language switching
 */
export const getInsightConfigs = (): InsightConfig[] => [
  {
    id: 'redFlags',
    icon: '🚩',
    title: i18n.t('insights.redFlags.title'),
    unlockText: i18n.t('insights.redFlags.unlockText'),
    explanationTitle: i18n.t('insights.redFlags.explanationTitle'),
    explanationText: i18n.t('insights.redFlags.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.redFlags.badgeText', { count: insights.redFlags.count }),
      colorKey: 'error',
    }),
    getItems: (insights) => insights.redFlags.items,
  },
  {
    id: 'greenFlags',
    icon: '✅',
    title: i18n.t('insights.greenFlags.title'),
    unlockText: i18n.t('insights.greenFlags.unlockText'),
    explanationTitle: i18n.t('insights.greenFlags.explanationTitle'),
    explanationText: i18n.t('insights.greenFlags.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.greenFlags.badgeText', { count: insights.greenFlags.count }),
      colorKey: 'success',
    }),
    getItems: (insights) => insights.greenFlags.items,
  },
  {
    id: 'compatibilityScore',
    icon: '💯',
    title: i18n.t('insights.compatibilityScore.title'),
    unlockText: i18n.t('insights.compatibilityScore.unlockText'),
    explanationTitle: i18n.t('insights.compatibilityScore.explanationTitle'),
    explanationText: i18n.t('insights.compatibilityScore.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.compatibilityScore.badgeText', {
        percentage: insights.compatibilityScore.percentage,
        rating: insights.compatibilityScore.rating,
      }),
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.compatibilityScore.items,
  },
  {
    id: 'loveLanguage',
    icon: '❤️',
    title: i18n.t('insights.loveLanguage.title'),
    unlockText: i18n.t('insights.loveLanguage.unlockText'),
    explanationTitle: i18n.t('insights.loveLanguage.explanationTitle'),
    explanationText: i18n.t('insights.loveLanguage.explanationText'),
    getBadge: (insights) => ({
      text: insights.loveLanguage.primary,
      colorKey: 'error',
    }),
    getItems: (insights) => insights.loveLanguage.items,
  },
  {
    id: 'weVsIRatio',
    icon: '👥',
    title: i18n.t('insights.weVsIRatio.title'),
    unlockText: i18n.t('insights.weVsIRatio.unlockText'),
    explanationTitle: i18n.t('insights.weVsIRatio.explanationTitle'),
    explanationText: i18n.t('insights.weVsIRatio.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.weVsIRatio.badgeText', { percentage: insights.weVsIRatio.percentage }),
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.weVsIRatio.items,
  },
  {
    id: 'sharedInterests',
    icon: '🎯',
    title: i18n.t('insights.sharedInterests.title'),
    unlockText: i18n.t('insights.sharedInterests.unlockText'),
    explanationTitle: i18n.t('insights.sharedInterests.explanationTitle'),
    explanationText: i18n.t('insights.sharedInterests.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.sharedInterests.badgeText', { count: insights.sharedInterests.count }),
      colorKey: 'success',
    }),
    getItems: (insights) => insights.sharedInterests.items,
  },
  {
    id: 'reciprocityScore',
    icon: '⚖️',
    title: i18n.t('insights.reciprocityScore.title'),
    unlockText: i18n.t('insights.reciprocityScore.unlockText'),
    explanationTitle: i18n.t('insights.reciprocityScore.explanationTitle'),
    explanationText: i18n.t('insights.reciprocityScore.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.reciprocityScore.badgeText', {
        percentage: insights.reciprocityScore.percentage,
        rating: insights.reciprocityScore.rating,
      }),
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.reciprocityScore.items,
  },
  {
    id: 'attachmentStyle',
    icon: '🔗',
    title: i18n.t('insights.attachmentStyle.title'),
    unlockText: i18n.t('insights.attachmentStyle.unlockText'),
    explanationTitle: i18n.t('insights.attachmentStyle.explanationTitle'),
    explanationText: i18n.t('insights.attachmentStyle.explanationText'),
    getBadge: (insights) => ({
      text: insights.attachmentStyle.type,
      colorKey: 'info',
    }),
    getItems: (insights) => insights.attachmentStyle.items,
  },
  {
    id: 'compliments',
    icon: '💐',
    title: i18n.t('insights.compliments.title'),
    unlockText: i18n.t('insights.compliments.unlockText'),
    explanationTitle: i18n.t('insights.compliments.explanationTitle'),
    explanationText: i18n.t('insights.compliments.explanationText'),
    getBadge: (insights, getFrequencyLabel) => ({
      text: getFrequencyLabel(insights.compliments.count),
      colorKey: 'success',
    }),
    getItems: (insights) => insights.compliments.items,
  },
  {
    id: 'criticism',
    icon: '⚠️',
    title: i18n.t('insights.criticism.title'),
    unlockText: i18n.t('insights.criticism.unlockText'),
    explanationTitle: i18n.t('insights.criticism.explanationTitle'),
    explanationText: i18n.t('insights.criticism.explanationText'),
    getBadge: (insights, getFrequencyLabel) => ({
      text: getFrequencyLabel(insights.criticism.count),
      colorKey: 'warning',
    }),
    getItems: (insights) => insights.criticism.items,
  },
  {
    id: 'conflictResolution',
    icon: '🤝',
    title: i18n.t('insights.conflictResolution.title'),
    unlockText: i18n.t('insights.conflictResolution.unlockText'),
    explanationTitle: i18n.t('insights.conflictResolution.explanationTitle'),
    explanationText: i18n.t('insights.conflictResolution.explanationText'),
    getBadge: (insights) => ({
      text: insights.conflictResolution.type,
      colorKey: 'info',
    }),
    getItems: (insights) => insights.conflictResolution.items,
  },
  {
    id: 'relationshipTips',
    icon: '💡',
    title: i18n.t('insights.relationshipTips.title'),
    unlockText: i18n.t('insights.relationshipTips.unlockText'),
    explanationTitle: i18n.t('insights.relationshipTips.explanationTitle'),
    explanationText: i18n.t('insights.relationshipTips.explanationText'),
    getBadge: (insights) => ({
      text: i18n.t('insights.relationshipTips.badgeText', { count: insights.relationshipTips.count }),
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.relationshipTips.tips,
  },
]
