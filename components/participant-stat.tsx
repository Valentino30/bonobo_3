import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { parseNumberWithUnit } from '@/utils/value-parser'
import { StyleSheet, View } from 'react-native'

interface ParticipantData {
  name: string
  value: string | number
  progressValue?: number
  progressColor?: string
}

interface ParticipantStatProps {
  participant: ParticipantData
}

export function ParticipantStat({ participant }: ParticipantStatProps) {
  const theme = useTheme()
  const parsedValue = parseNumberWithUnit(participant.value)

  return (
    <View style={styles.participantItem}>
      <ThemedText style={[styles.participantName, { color: theme.colors.textTertiary }]} numberOfLines={1}>
        {participant.name}
      </ThemedText>

      {parsedValue.hasUnit ? (
        <View style={styles.valueWithUnit}>
          <ThemedText style={[styles.participantNumber, { color: theme.colors.text }]}>{parsedValue.number}</ThemedText>
          <ThemedText style={[styles.unitText, { color: theme.colors.textSecondary }]}>{parsedValue.unit}</ThemedText>
        </View>
      ) : (
        <ThemedText style={[styles.participantNumber, { color: theme.colors.text }]} numberOfLines={1}>
          {parsedValue.fullValue}
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
}

const styles = StyleSheet.create({
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
})
