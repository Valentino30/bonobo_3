import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { FlippableCard } from '@/components/flippable-card'
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
        {participants.map((participant, index) => {
          // Split value into number and unit if it's a string like "123 words"
          const valueString = String(participant.value)
          const match = valueString.match(/^(\d+)\s+(.+)$/)
          const hasUnit = match !== null

          return (
            <View key={index} style={styles.participantItem}>
              <ThemedText style={[styles.participantName, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                {participant.name}
              </ThemedText>
              {hasUnit ? (
                <View style={styles.valueWithUnit}>
                  <ThemedText style={[styles.participantNumber, { color: theme.colors.text }]}>{match[1]}</ThemedText>
                  <ThemedText style={[styles.unitText, { color: theme.colors.textSecondary }]}>{match[2]}</ThemedText>
                </View>
              ) : (
                <ThemedText style={[styles.participantNumber, { color: theme.colors.text }]} numberOfLines={1}>
                  {participant.value}
                </ThemedText>
              )}
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
          )
        })}
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
  ) : (
    frontContent
  )

  return (
    <FlippableCard
      front={frontContent}
      back={backContent}
      index={index}
      containerStyle={styles.cardContainer}
      height={200}
    />
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
    height: '100%',
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
    textAlign: 'center',
    width: '100%',
  },
  valueWithUnit: {
    alignItems: 'center',
    width: '100%',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
    textTransform: 'lowercase',
    marginTop: 4,
    opacity: 0.5,
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
