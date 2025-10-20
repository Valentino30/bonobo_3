import { ComparisonCard } from '@/components/comparison-card'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { useTheme } from '@/contexts/theme-context'
import { type ChatAnalysisData } from '@/hooks/use-chat-analysis'
import { formatResponseTime, getInitiationDescription, getInterestDescription } from '@/utils/analysis-formatters'
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
          description={getInitiationDescription(analysis)}
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
        description={getInterestDescription(analysis)}
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
