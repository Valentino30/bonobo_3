import { AnimatedCard } from '@/components/animated-card'
import { FlippableCard } from '@/components/flippable-card'
import { ParticipantStat } from '@/components/participant-stat'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
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
  description?: string
  index?: number
}

export function ComparisonCard({ title, icon, participants, description, index }: ComparisonCardProps) {
  const theme = useTheme()

  const frontContent = (
    <ThemedView
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.backgroundLight,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <ThemedText style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{title}</ThemedText>
        <ThemedText style={styles.iconText}>{icon}</ThemedText>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.colors.backgroundSecondary }]} />
      <View style={styles.participantRow}>
        {participants.map((participant, index) => (
          <ParticipantStat key={index} participant={participant} />
        ))}
      </View>
    </ThemedView>
  )

  const backContent = description ? (
    <ThemedView
      style={[
        styles.statCard,
        styles.backCard,
        {
          backgroundColor: theme.colors.backgroundLight,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <ThemedText style={[styles.descriptionLarge, { color: theme.colors.text }]}>{description}</ThemedText>
      <ThemedText style={[styles.tapHint, { color: theme.colors.textTertiary }]}>Tap to see stats</ThemedText>
    </ThemedView>
  ) : null

  if (description) {
    return (
      <AnimatedCard index={index} containerStyle={styles.cardContainer}>
        <FlippableCard front={frontContent} back={backContent!} />
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard index={index} containerStyle={styles.cardContainer}>
      {frontContent}
    </AnimatedCard>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  backCard: {
    justifyContent: 'center',
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
  descriptionLarge: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tapHint: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
})
