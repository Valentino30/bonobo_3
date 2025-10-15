import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, View } from 'react-native'

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
  return (
    <ThemedView style={styles.statCard}>
      <View style={styles.titleRow}>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        <ThemedText style={styles.iconText}>{icon}</ThemedText>
      </View>
      <View style={styles.divider} />
      <View style={styles.participantRow}>
        {participants.map((participant, index) => (
          <View key={index} style={styles.participantItem}>
            <ThemedText style={styles.participantName} numberOfLines={1}>{participant.name}</ThemedText>
            <ThemedText style={styles.participantNumber}>{participant.value}</ThemedText>
            {participant.progressValue !== undefined && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${participant.progressValue}%`,
                      backgroundColor: participant.progressColor || '#4A90E2',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
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
    color: '#666666',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  iconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
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
    color: '#999999',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  participantNumber: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F5F5F5',
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
