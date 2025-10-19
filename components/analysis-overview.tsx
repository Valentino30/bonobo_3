import { ComparisonCard } from '@/components/comparison-card'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { useTheme } from '@/contexts/theme-context'
import { type ChatAnalysisData } from '@/hooks/use-chat-analysis'
import { StyleSheet, View } from 'react-native'

type AnalysisOverviewProps = {
  analysis: ChatAnalysisData
}

/**
 * Overview tab content for chat analysis
 * Displays statistical analysis cards with comparisons between participants
 */
export function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
  const theme = useTheme()

  // Helper: Format response time for display
  const formatResponseTime = (hours: number): string => {
    return hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`
  }

  // Helper: Generate description for initiation rate comparison
  const getInitiationDescription = (): string => {
    const rate1 = analysis.participant1.initiationRate ?? 0
    const rate2 = analysis.participant2.initiationRate ?? 0

    if (rate1 > rate2) {
      return `This indicates that ${analysis.participant1.name} starts conversations more often than ${analysis.participant2.name}, which may suggest a higher level of interest or eagerness to engage.`
    }

    if (rate2 > rate1) {
      return `This indicates that ${analysis.participant2.name} starts conversations more often than ${analysis.participant1.name}, which may suggest a higher level of interest or eagerness to engage.`
    }

    return `Both participants initiate conversations equally, indicating a balanced level of interest and engagement from both sides.`
  }

  // Helper: Generate description for interest level comparison
  const getInterestDescription = (): string => {
    const level1 = analysis.participant1.interestLevel
    const level2 = analysis.participant2.interestLevel

    if (level1 > level2) {
      return `${analysis.participant1.name} shows a higher overall engagement score (${level1}%) compared to ${analysis.participant2.name} (${level2}%), based on response time, message length, and frequency. This suggests ${analysis.participant1.name} may be more invested in the conversation.`
    }

    if (level2 > level1) {
      return `${analysis.participant2.name} shows a higher overall engagement score (${level2}%) compared to ${analysis.participant1.name} (${level1}%), based on response time, message length, and frequency. This suggests ${analysis.participant2.name} may be more invested in the conversation.`
    }

    return `Both participants show equal engagement levels (${level1}%), indicating a balanced investment in the conversation from both sides.`
  }

  return (
    <View style={styles.container}>
      {/* Total Messages Card */}
      <SimpleStatCard title="Total Messages" icon="💬" value={analysis.totalMessages} />

      {/* Messages per Participant Card */}
      <ComparisonCard
        title="Messages per Participant"
        icon="👥"
        participants={[
          {
            name: analysis.participant1.name,
            value: analysis.participant1.messageCount,
          },
          {
            name: analysis.participant2.name,
            value: analysis.participant2.messageCount,
          },
        ]}
      />

      {/* Response Time Card */}
      <ComparisonCard
        title="Average Response Time"
        icon="⏱️"
        participants={[
          {
            name: analysis.participant1.name,
            value: formatResponseTime(analysis.participant1.averageResponseTime),
          },
          {
            name: analysis.participant2.name,
            value: formatResponseTime(analysis.participant2.averageResponseTime),
          },
        ]}
      />

      {/* Average Message Length Card */}
      <ComparisonCard
        title="Average Message Length"
        icon="📝"
        participants={[
          {
            name: analysis.participant1.name,
            value: `${analysis.participant1.averageMessageLength} chars`,
          },
          {
            name: analysis.participant2.name,
            value: `${analysis.participant2.averageMessageLength} chars`,
          },
        ]}
      />

      {/* Initiation Rate Card */}
      {analysis.participant1.initiationRate !== undefined && (
        <ComparisonCard
          title="Initiation Rate"
          icon="🚀"
          description={getInitiationDescription()}
          participants={[
            {
              name: analysis.participant1.name,
              value: `${analysis.participant1.initiationRate}%`,
              progressValue: analysis.participant1.initiationRate,
              progressColor: theme.colors.info,
            },
            {
              name: analysis.participant2.name,
              value: `${analysis.participant2.initiationRate ?? 0}%`,
              progressValue: analysis.participant2.initiationRate ?? 0,
              progressColor: theme.colors.error,
            },
          ]}
        />
      )}

      {/* Interest Level Card */}
      <ComparisonCard
        title="Interest Level"
        icon="❤️"
        description={getInterestDescription()}
        participants={[
          {
            name: analysis.participant1.name,
            value: `${analysis.participant1.interestLevel}%`,
            progressValue: analysis.participant1.interestLevel,
            progressColor: theme.colors.info,
          },
          {
            name: analysis.participant2.name,
            value: `${analysis.participant2.interestLevel}%`,
            progressValue: analysis.participant2.interestLevel,
            progressColor: theme.colors.error,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
})
