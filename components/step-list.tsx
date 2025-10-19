import { ThemedText } from '@/components/themed-text'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

export interface Step {
  title: string
  description: string
}

interface StepListProps {
  title?: string
  steps: Step[]
}

export function StepList({ title, steps }: StepListProps) {
  const theme = useTheme()

  return (
    <View style={styles.stepsContainer}>
      {title && (
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.darkOverlay }]}>
          {title}
        </ThemedText>
      )}

      {steps.map((step, index) => (
        <View key={index} style={styles.step}>
          <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
            <ThemedText style={[styles.stepNumberText, { color: theme.colors.textWhite }]}>
              {index + 1}
            </ThemedText>
          </View>
          <View style={styles.stepContent}>
            <ThemedText style={[styles.stepTitle, { color: theme.colors.darkOverlay }]}>
              {step.title}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: theme.colors.primaryDark }]}>
              {step.description}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  stepsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
})
