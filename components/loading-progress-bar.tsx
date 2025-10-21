import { useTheme } from '@/contexts/theme-context'
import { Animated, StyleSheet, Text, View } from 'react-native'

type LoadingProgressBarProps = {
  currentStep: number
  totalSteps: number
  progressWidth: Animated.AnimatedInterpolation<string>
}

/**
 * Progress bar component for multi-step loading sequences
 * Displays animated progress bar with step counter
 */
export function LoadingProgressBar({ currentStep, totalSteps, progressWidth }: LoadingProgressBarProps) {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.backgroundSecondary }]}>
        <Animated.View style={[styles.progressBarFill, { backgroundColor: theme.colors.primary, width: progressWidth }]} />
      </View>
      <Text style={[styles.progressText, { color: theme.colors.primary }]}>
        {currentStep} of {totalSteps}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
})
