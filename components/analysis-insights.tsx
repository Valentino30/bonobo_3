import { InsightCard } from '@/components/insight-card'
import { LockedInsightCard } from '@/components/locked-insight-card'
import { useTheme } from '@/contexts/theme-context'
import { type AIInsights } from '@/utils/ai-service'
import { StyleSheet, View } from 'react-native'

type InsightConfig = {
  id: string
  icon: string
  title: string
  unlockText: string
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

  // Configuration for all insights in order
  const insights: InsightConfig[] = [
    { id: 'redFlags', icon: '🚩', title: 'Red Flags', unlockText: 'What are the warning signs?' },
    { id: 'greenFlags', icon: '✅', title: 'Green Flags', unlockText: 'What are the positive signs?' },
    { id: 'compatibilityScore', icon: '💯', title: 'Compatibility Score', unlockText: 'How compatible are you?' },
    { id: 'loveLanguage', icon: '❤️', title: 'Love Language', unlockText: 'How do you show love?' },
    { id: 'weVsIRatio', icon: '👥', title: '"We" vs "I" Language', unlockText: 'How connected are you?' },
    { id: 'sharedInterests', icon: '🎯', title: 'Shared Interests', unlockText: 'What do you have in common?' },
    { id: 'reciprocityScore', icon: '⚖️', title: 'Reciprocity Score', unlockText: 'How balanced is this relationship?' },
    { id: 'attachmentStyle', icon: '🔗', title: 'Attachment Style', unlockText: "What's the attachment pattern?" },
    { id: 'compliments', icon: '💐', title: 'Compliments', unlockText: 'How often do they compliment?' },
    { id: 'criticism', icon: '⚠️', title: 'Criticism', unlockText: 'Are there critical moments?' },
    { id: 'conflictResolution', icon: '🤝', title: 'Conflict Resolution', unlockText: 'How do you handle disagreements?' },
    { id: 'relationshipTips', icon: '💡', title: 'Relationship Tips', unlockText: 'What can you improve?' },
  ]

  // Render individual insight card (unlocked or locked)
  const renderInsightCard = (config: InsightConfig) => {
    const { id, icon, title, unlockText } = config

    if (isInsightUnlocked(id) && aiInsights) {
      return renderUnlockedInsight(id, icon, title)
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
  const renderUnlockedInsight = (id: string, icon: string, title: string) => {
    if (!aiInsights) return null

    switch (id) {
      case 'redFlags':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.redFlags.description}
            items={aiInsights.redFlags.items}
            badge={{ text: `${aiInsights.redFlags.count} Found`, color: theme.colors.error }}
          />
        )

      case 'greenFlags':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.greenFlags.description}
            items={aiInsights.greenFlags.items}
            badge={{ text: `${aiInsights.greenFlags.count} Found`, color: theme.colors.success }}
          />
        )

      case 'compatibilityScore':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.compatibilityScore.description}
            items={aiInsights.compatibilityScore.items}
            badge={{
              text: `${aiInsights.compatibilityScore.percentage}% ${aiInsights.compatibilityScore.rating}`,
              color: theme.colors.primary,
            }}
          />
        )

      case 'loveLanguage':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.loveLanguage.description}
            items={aiInsights.loveLanguage.items}
            badge={{ text: aiInsights.loveLanguage.primary, color: theme.colors.error }}
          />
        )

      case 'weVsIRatio':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.weVsIRatio.description}
            items={aiInsights.weVsIRatio.items}
            badge={{ text: `${aiInsights.weVsIRatio.percentage}% "We"`, color: theme.colors.primary }}
          />
        )

      case 'sharedInterests':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.sharedInterests.description}
            items={aiInsights.sharedInterests.items}
            badge={{ text: `${aiInsights.sharedInterests.count} Found`, color: theme.colors.success }}
          />
        )

      case 'reciprocityScore':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.reciprocityScore.description}
            items={aiInsights.reciprocityScore.items}
            badge={{
              text: `${aiInsights.reciprocityScore.percentage}% ${aiInsights.reciprocityScore.rating}`,
              color: theme.colors.primary,
            }}
          />
        )

      case 'attachmentStyle':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.attachmentStyle.description}
            items={aiInsights.attachmentStyle.items}
            badge={{ text: aiInsights.attachmentStyle.type, color: theme.colors.info }}
          />
        )

      case 'compliments':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.compliments.description}
            items={aiInsights.compliments.items}
            badge={{ text: getFrequencyLabel(aiInsights.compliments.count), color: theme.colors.success }}
          />
        )

      case 'criticism':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.criticism.description}
            items={aiInsights.criticism.items}
            badge={{ text: getFrequencyLabel(aiInsights.criticism.count), color: theme.colors.warning }}
          />
        )

      case 'conflictResolution':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.conflictResolution.description}
            items={aiInsights.conflictResolution.items}
            badge={{ text: aiInsights.conflictResolution.type, color: theme.colors.info }}
          />
        )

      case 'relationshipTips':
        return (
          <InsightCard
            key={id}
            icon={icon}
            title={title}
            description={aiInsights.relationshipTips.description}
            items={aiInsights.relationshipTips.tips}
            badge={{ text: `${aiInsights.relationshipTips.count} Tips`, color: theme.colors.primary }}
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
