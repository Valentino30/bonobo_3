import { StyleSheet, View } from 'react-native'

import { ComparisonCard } from '@/components/comparison-card'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { OVERVIEW_CARDS } from '@/constants/analysis-overview'
import { useTheme } from '@/contexts/theme-context'
import { type ChatAnalysisData } from '@/hooks/use-chat-analysis'

type AnalysisOverviewProps = {
  analysis: ChatAnalysisData
}

/**
 * Overview tab content for chat analysis
 * Displays statistical analysis cards with comparisons between participants
 */
export function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
  const theme = useTheme()

  const renderCard = (card: (typeof OVERVIEW_CARDS)[number], index: number) => {
    // Check if card should be shown
    if (card.shouldShow && !card.shouldShow(analysis)) {
      return null
    }

    // Render simple stat card
    if (card.type === 'simple' && card.getValue) {
      return (
        <SimpleStatCard
          key={card.id}
          title={card.title}
          icon={card.icon}
          value={card.getValue(analysis)}
          index={index}
        />
      )
    }

    // Render comparison card
    if (card.type === 'comparison' && card.getParticipants) {
      const colors = { info: theme.colors.info, error: theme.colors.error }
      return (
        <ComparisonCard
          key={card.id}
          title={card.title}
          icon={card.icon}
          description={card.description?.(analysis)}
          participants={card.getParticipants(analysis, colors)}
          index={index}
        />
      )
    }

    return null
  }

  return <View style={styles.container}>{OVERVIEW_CARDS.map((card, index) => renderCard(card, index))}</View>
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
})
