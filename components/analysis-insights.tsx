import { FlippableInsightCard } from '@/components/flippable-insight-card'
import { LockedInsightCard } from '@/components/locked-insight-card'
import { INSIGHT_CONFIGS, type InsightConfig } from '@/constants/insights'
import { useTheme } from '@/contexts/theme-context'
import { type AIInsights } from '@/utils/ai-service'
import { StyleSheet, View } from 'react-native'

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

  // Render individual insight card (unlocked or locked)
  const renderInsightCard = (config: InsightConfig) => {
    const { id, icon, title, unlockText } = config

    if (isInsightUnlocked(id) && aiInsights) {
      return renderUnlockedInsight(config)
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

  // Render unlocked insight with data using config
  const renderUnlockedInsight = (config: InsightConfig) => {
    if (!aiInsights) return null

    const { id, icon, title, explanationTitle, explanationText } = config
    const insightData = aiInsights[id]
    const badge = config.getBadge(aiInsights, getFrequencyLabel)
    const items = config.getItems(aiInsights)

    return (
      <FlippableInsightCard
        key={id}
        icon={icon}
        title={title}
        description={insightData.description}
        items={items}
        badge={{ text: badge.text, color: theme.colors[badge.colorKey] }}
        explanationTitle={explanationTitle}
        explanationText={explanationText}
      />
    )
  }

  return <View style={styles.container}>{INSIGHT_CONFIGS.map((config) => renderInsightCard(config))}</View>
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
})
