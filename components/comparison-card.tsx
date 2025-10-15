import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

interface ParticipantData {
  name: string
  value: string | number
  progressValue?: number
  progressColor?: string
}

interface ComparisonCardProps {
  title: string
  icon: string
  participants: ParticipantData[]
}

export function ComparisonCard({ title, icon, participants }: ComparisonCardProps) {
  const theme = useTheme()

  return (
    <ThemedView style={[styles.statCard, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.borderLight, shadowColor: theme.colors.shadow }]}>
      <View style={styles.titleRow}>
        <ThemedText style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{title}</ThemedText>
        <ThemedText style={styles.iconText}>{icon}</ThemedText>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.colors.backgroundSecondary }]} />
      <View style={styles.participantRow}>
        {participants.map((participant, index) => (
          <View key={index} style={styles.participantItem}>
            <ThemedText style={[styles.participantName, { color: theme.colors.textTertiary }]} numberOfLines={1}>{participant.name}</ThemedText>
            <ThemedText style={[styles.participantNumber, { color: theme.colors.text }]}>{participant.value}</ThemedText>
            {participant.progressValue !== undefined && (
              <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${participant.progressValue}%`,
                      backgroundColor: participant.progressColor || theme.colors.info,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  iconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 24,
  },
  participantItem: {
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  participantNumber: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
})
