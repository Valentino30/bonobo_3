import { type AIInsights } from '@/utils/ai-service'

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
 */
export const INSIGHT_CONFIGS: InsightConfig[] = [
  {
    id: 'redFlags',
    icon: '🚩',
    title: 'Red Flags',
    unlockText: 'What are the warning signs?',
    explanationTitle: 'Pattern Recognition',
    explanationText:
      "We analyze subtle patterns in how conflicts start, how boundaries are respected, and whether concerns get dismissed or heard. What seems like small moments can reveal larger dynamics worth addressing early.",
    getBadge: (insights) => ({
      text: `${insights.redFlags.count} Found`,
      colorKey: 'error',
    }),
    getItems: (insights) => insights.redFlags.items,
  },
  {
    id: 'greenFlags',
    icon: '✅',
    title: 'Green Flags',
    unlockText: 'What are the positive signs?',
    explanationTitle: 'Strength Indicators',
    explanationText:
      "Beyond obvious positivity, we look for signs of emotional safety, mutual support during stress, and how you handle vulnerability. These patterns predict long-term relationship satisfaction better than chemistry alone.",
    getBadge: (insights) => ({
      text: `${insights.greenFlags.count} Found`,
      colorKey: 'success',
    }),
    getItems: (insights) => insights.greenFlags.items,
  },
  {
    id: 'compatibilityScore',
    icon: '💯',
    title: 'Compatibility Score',
    unlockText: 'How compatible are you?',
    explanationTitle: 'Beyond Surface Level',
    explanationText:
      "This score weighs communication rhythm, conflict resolution styles, and emotional reciprocity - not just shared interests. High compatibility means less friction in daily interactions, though growth is always possible with awareness.",
    getBadge: (insights) => ({
      text: `${insights.compatibilityScore.percentage}% ${insights.compatibilityScore.rating}`,
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.compatibilityScore.items,
  },
  {
    id: 'loveLanguage',
    icon: '❤️',
    title: 'Love Language',
    unlockText: 'How do you show love?',
    explanationTitle: 'Communication Preferences',
    explanationText:
      "We detect whether you show affection through words, actions, or quality time. Mismatched love languages cause 'invisible effort' - you're trying, but your partner can't feel it. Alignment multiplies impact.",
    getBadge: (insights) => ({
      text: insights.loveLanguage.primary,
      colorKey: 'error',
    }),
    getItems: (insights) => insights.loveLanguage.items,
  },
  {
    id: 'weVsIRatio',
    icon: '👥',
    title: '"We" vs "I" Language',
    unlockText: 'How connected are you?',
    explanationTitle: 'Linguistic Insight',
    explanationText:
      'Research shows couples who naturally use "we" language have lower stress hormones during conflicts and stay together longer. But too much can indicate codependency - the sweet spot balances partnership with individuality.',
    getBadge: (insights) => ({
      text: `${insights.weVsIRatio.percentage}% "We"`,
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.weVsIRatio.items,
  },
  {
    id: 'sharedInterests',
    icon: '🎯',
    title: 'Shared Interests',
    unlockText: 'What do you have in common?',
    explanationTitle: 'The Novelty Factor',
    explanationText:
      "Shared interests matter less than you think - but shared curiosity matters more. Couples who explore new things together maintain attraction longer than those who just share existing hobbies. Growth > overlap.",
    getBadge: (insights) => ({
      text: `${insights.sharedInterests.count} Found`,
      colorKey: 'success',
    }),
    getItems: (insights) => insights.sharedInterests.items,
  },
  {
    id: 'reciprocityScore',
    icon: '⚖️',
    title: 'Reciprocity Score',
    unlockText: 'How balanced is this relationship?',
    explanationTitle: 'The Effort Ratio',
    explanationText:
      "We track who initiates, who asks questions, and who does emotional labor. Perfect 50/50 is rare - but imbalances over 70/30 often breed resentment. Awareness of patterns is the first step to rebalancing.",
    getBadge: (insights) => ({
      text: `${insights.reciprocityScore.percentage}% ${insights.reciprocityScore.rating}`,
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.reciprocityScore.items,
  },
  {
    id: 'attachmentStyle',
    icon: '🔗',
    title: 'Attachment Style',
    unlockText: "What's the attachment pattern?",
    explanationTitle: 'Your Relationship Blueprint',
    explanationText:
      "Your attachment style, formed in childhood, shapes how you handle closeness and conflict today. Anxious-avoidant pairings create push-pull dynamics. But attachment isn't fixed - with awareness, you can develop more secure patterns.",
    getBadge: (insights) => ({
      text: insights.attachmentStyle.type,
      colorKey: 'info',
    }),
    getItems: (insights) => insights.attachmentStyle.items,
  },
  {
    id: 'compliments',
    icon: '💐',
    title: 'Compliments',
    unlockText: 'How often do they compliment?',
    explanationTitle: 'The 5:1 Magic Ratio',
    explanationText:
      "Gottman's research found stable couples maintain 5 positive interactions for every negative one. We analyze compliment frequency, specificity, and timing. Generic praise matters less than noticing specific efforts.",
    getBadge: (insights, getFrequencyLabel) => ({
      text: getFrequencyLabel(insights.compliments.count),
      colorKey: 'success',
    }),
    getItems: (insights) => insights.compliments.items,
  },
  {
    id: 'criticism',
    icon: '⚠️',
    title: 'Criticism',
    unlockText: 'Are there critical moments?',
    explanationTitle: 'The Four Horsemen',
    explanationText:
      "Gottman identifies criticism (attacking character vs behavior) as a relationship killer. We detect patterns of contempt, defensiveness, and stonewalling - the warning signs before relationships end. Early detection allows course correction.",
    getBadge: (insights, getFrequencyLabel) => ({
      text: getFrequencyLabel(insights.criticism.count),
      colorKey: 'warning',
    }),
    getItems: (insights) => insights.criticism.items,
  },
  {
    id: 'conflictResolution',
    icon: '🤝',
    title: 'Conflict Resolution',
    unlockText: 'How do you handle disagreements?',
    explanationTitle: 'Repair Attempts',
    explanationText:
      "During conflict, we track 'repair attempts' - small gestures to de-escalate tension. Successful couples make and accept these bids 86% of the time. Failed repairs predict breakups more accurately than the conflict itself.",
    getBadge: (insights) => ({
      text: insights.conflictResolution.type,
      colorKey: 'info',
    }),
    getItems: (insights) => insights.conflictResolution.items,
  },
  {
    id: 'relationshipTips',
    icon: '💡',
    title: 'Relationship Tips',
    unlockText: 'What can you improve?',
    explanationTitle: 'Targeted Interventions',
    explanationText:
      "Based on your specific patterns, we suggest micro-adjustments with outsized impact. Small changes in how you respond during stress or ask questions can shift relationship trajectories significantly over time.",
    getBadge: (insights) => ({
      text: `${insights.relationshipTips.count} Tips`,
      colorKey: 'primary',
    }),
    getItems: (insights) => insights.relationshipTips.tips,
  },
]
