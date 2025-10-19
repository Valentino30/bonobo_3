import { FlippableInsightCard } from '@/components/flippable-insight-card'
import { LockedInsightCard } from '@/components/locked-insight-card'
import { useTheme } from '@/contexts/theme-context'
import { type AIInsights } from '@/utils/ai-service'
import { StyleSheet, View } from 'react-native'

type InsightConfig = {
  id: string
  icon: string
  title: string
  unlockText: string
  explanationTitle: string
  explanationText: string
}

type AnalysisInsightsProps = {
  aiInsights: AIInsights | null
  isInsightUnlocked: (insightId: string) => boolean
  loadingInsight: string | null
  onUnlockInsight: (insightId: string) => void
  getFrequencyLabel: (count: number) => string
}

/**
 * Insights tab content for chat analysis
 * Displays AI-powered insights with lock/unlock functionality
 */
export function AnalysisInsights({
  aiInsights,
  isInsightUnlocked,
  loadingInsight,
  onUnlockInsight,
  getFrequencyLabel,
}: AnalysisInsightsProps) {
  const theme = useTheme()

  // Configuration for all insights in order with fun explanations
  const insights: InsightConfig[] = [
    {
      id: 'redFlags',
      icon: '🚩',
      title: 'Red Flags',
      unlockText: 'What are the warning signs?',
      explanationTitle: 'Pattern Recognition',
      explanationText:
        "We analyze subtle patterns in how conflicts start, how boundaries are respected, and whether concerns get dismissed or heard. What seems like small moments can reveal larger dynamics worth addressing early.",
    },
    {
      id: 'greenFlags',
      icon: '✅',
      title: 'Green Flags',
      unlockText: 'What are the positive signs?',
      explanationTitle: 'Strength Indicators',
      explanationText:
        "Beyond obvious positivity, we look for signs of emotional safety, mutual support during stress, and how you handle vulnerability. These patterns predict long-term relationship satisfaction better than chemistry alone.",
    },
    {
      id: 'compatibilityScore',
      icon: '💯',
      title: 'Compatibility Score',
      unlockText: 'How compatible are you?',
      explanationTitle: 'Beyond Surface Level',
      explanationText:
        "This score weighs communication rhythm, conflict resolution styles, and emotional reciprocity - not just shared interests. High compatibility means less friction in daily interactions, though growth is always possible with awareness.",
    },
    {
      id: 'loveLanguage',
      icon: '❤️',
      title: 'Love Language',
      unlockText: 'How do you show love?',
      explanationTitle: 'Communication Preferences',
      explanationText:
        "We detect whether you show affection through words, actions, or quality time. Mismatched love languages cause 'invisible effort' - you're trying, but your partner can't feel it. Alignment multiplies impact.",
    },
    {
      id: 'weVsIRatio',
      icon: '👥',
      title: '"We" vs "I" Language',
      unlockText: 'How connected are you?',
      explanationTitle: 'Linguistic Insight',
      explanationText:
        'Research shows couples who naturally use "we" language have lower stress hormones during conflicts and stay together longer. But too much can indicate codependency - the sweet spot balances partnership with individuality.',
    },
    {
      id: 'sharedInterests',
      icon: '🎯',
      title: 'Shared Interests',
      unlockText: 'What do you have in common?',
      explanationTitle: 'The Novelty Factor',
      explanationText:
        "Shared interests matter less than you think - but shared curiosity matters more. Couples who explore new things together maintain attraction longer than those who just share existing hobbies. Growth > overlap.",
    },
    {
      id: 'reciprocityScore',
      icon: '⚖️',
      title: 'Reciprocity Score',
      unlockText: 'How balanced is this relationship?',
      explanationTitle: 'The Effort Ratio',
      explanationText:
        "We track who initiates, who asks questions, and who does emotional labor. Perfect 50/50 is rare - but imbalances over 70/30 often breed resentment. Awareness of patterns is the first step to rebalancing.",
    },
    {
      id: 'attachmentStyle',
      icon: '🔗',
      title: 'Attachment Style',
      unlockText: "What's the attachment pattern?",
      explanationTitle: 'Your Relationship Blueprint',
      explanationText:
        "Your attachment style, formed in childhood, shapes how you handle closeness and conflict today. Anxious-avoidant pairings create push-pull dynamics. But attachment isn't fixed - with awareness, you can develop more secure patterns.",
    },
    {
      id: 'compliments',
      icon: '💐',
      title: 'Compliments',
      unlockText: 'How often do they compliment?',
      explanationTitle: 'The 5:1 Magic Ratio',
      explanationText:
        "Gottman's research found stable couples maintain 5 positive interactions for every negative one. We analyze compliment frequency, specificity, and timing. Generic praise matters less than noticing specific efforts.",
    },
    {
      id: 'criticism',
      icon: '⚠️',
      title: 'Criticism',
      unlockText: 'Are there critical moments?',
      explanationTitle: 'The Four Horsemen',
      explanationText:
        "Gottman identifies criticism (attacking character vs behavior) as a relationship killer. We detect patterns of contempt, defensiveness, and stonewalling - the warning signs before relationships end. Early detection allows course correction.",
    },
    {
      id: 'conflictResolution',
      icon: '🤝',
      title: 'Conflict Resolution',
      unlockText: 'How do you handle disagreements?',
      explanationTitle: 'Repair Attempts',
      explanationText:
        "During conflict, we track 'repair attempts' - small gestures to de-escalate tension. Successful couples make and accept these bids 86% of the time. Failed repairs predict breakups more accurately than the conflict itself.",
    },
    {
      id: 'relationshipTips',
      icon: '💡',
      title: 'Relationship Tips',
      unlockText: 'What can you improve?',
      explanationTitle: 'Targeted Interventions',
      explanationText:
        "Based on your specific patterns, we suggest micro-adjustments with outsized impact. Small changes in how you respond during stress or ask questions can shift relationship trajectories significantly over time.",
    },
  ]

  // Render individual insight card (unlocked or locked)
  const renderInsightCard = (config: InsightConfig) => {
    const { id, icon, title, unlockText, explanationTitle, explanationText } = config

    if (isInsightUnlocked(id) && aiInsights) {
      return renderUnlockedInsight(id, icon, title, explanationTitle, explanationText)
    }

    return (
      <LockedInsightCard
        key={id}
        icon={icon}
        title={title}
        onUnlock={() => onUnlockInsight(id)}
        isLoading={loadingInsight === id}
        unlockText={unlockText}
      />
    )
  }

  // Render unlocked insight with data
  const renderUnlockedInsight = (
    id: string,
    icon: string,
    title: string,
    explanationTitle: string,
    explanationText: string
  ) => {
    if (!aiInsights) return null

    switch (id) {
      case 'redFlags':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.redFlags.description}
            items={aiInsights.redFlags.items}
            badge={{ text: `${aiInsights.redFlags.count} Found`, color: theme.colors.error }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'greenFlags':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.greenFlags.description}
            items={aiInsights.greenFlags.items}
            badge={{ text: `${aiInsights.greenFlags.count} Found`, color: theme.colors.success }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'compatibilityScore':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.compatibilityScore.description}
            items={aiInsights.compatibilityScore.items}
            badge={{
              text: `${aiInsights.compatibilityScore.percentage}% ${aiInsights.compatibilityScore.rating}`,
              color: theme.colors.primary,
            }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'loveLanguage':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.loveLanguage.description}
            items={aiInsights.loveLanguage.items}
            badge={{ text: aiInsights.loveLanguage.primary, color: theme.colors.error }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'weVsIRatio':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.weVsIRatio.description}
            items={aiInsights.weVsIRatio.items}
            badge={{ text: `${aiInsights.weVsIRatio.percentage}% "We"`, color: theme.colors.primary }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'sharedInterests':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.sharedInterests.description}
            items={aiInsights.sharedInterests.items}
            badge={{ text: `${aiInsights.sharedInterests.count} Found`, color: theme.colors.success }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'reciprocityScore':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.reciprocityScore.description}
            items={aiInsights.reciprocityScore.items}
            badge={{
              text: `${aiInsights.reciprocityScore.percentage}% ${aiInsights.reciprocityScore.rating}`,
              color: theme.colors.primary,
            }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'attachmentStyle':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.attachmentStyle.description}
            items={aiInsights.attachmentStyle.items}
            badge={{ text: aiInsights.attachmentStyle.type, color: theme.colors.info }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'compliments':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.compliments.description}
            items={aiInsights.compliments.items}
            badge={{ text: getFrequencyLabel(aiInsights.compliments.count), color: theme.colors.success }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'criticism':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.criticism.description}
            items={aiInsights.criticism.items}
            badge={{ text: getFrequencyLabel(aiInsights.criticism.count), color: theme.colors.warning }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'conflictResolution':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.conflictResolution.description}
            items={aiInsights.conflictResolution.items}
            badge={{ text: aiInsights.conflictResolution.type, color: theme.colors.info }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      case 'relationshipTips':
        return (
          <FlippableInsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.relationshipTips.description}
            items={aiInsights.relationshipTips.tips}
            badge={{ text: `${aiInsights.relationshipTips.count} Tips`, color: theme.colors.primary }}
            explanationTitle={explanationTitle}
            explanationText={explanationText}
          />
        )

      default:
        return null
    }
  }

  return <View style={styles.container}>{insights.map((config) => renderInsightCard(config))}</View>
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
})
