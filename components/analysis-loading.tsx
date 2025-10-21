import { StyleSheet, View } from 'react-native'
import { AnimatedIcon } from '@/components/animated-icon'
import { InfoBanner } from '@/components/info-banner'
import { LoadingProgressBar } from '@/components/loading-progress-bar'
import { ThemedText } from '@/components/themed-text'
import { ANALYSIS_LOADING_STEPS } from '@/constants/analysis-loading'
import { useTheme } from '@/contexts/theme-context'
import { useLoadingAnimation } from '@/hooks/use-loading-animation'

export function AnalysisLoading({ onComplete }: { onComplete?: () => void }) {
  const theme = useTheme()
  const { currentStep, progressWidth } = useLoadingAnimation({
    stepCount: ANALYSIS_LOADING_STEPS.length,
    stepDuration: 1000,
    onComplete,
  })

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Main Content Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.backgroundLight,
            shadowColor: theme.colors.shadow,
            borderColor: theme.colors.backgroundSecondary,
          },
        ]}
      >
        {/* Animated Icon */}
        <View style={styles.iconWrapper}>
          <AnimatedIcon icon={ANALYSIS_LOADING_STEPS[currentStep].icon} animation="pulsate" />
        </View>

        {/* Title and Subtitle */}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title} lightColor={theme.colors.text}>
            {ANALYSIS_LOADING_STEPS[currentStep].title}
          </ThemedText>
          <ThemedText style={styles.subtitle} lightColor={theme.colors.textTertiary}>
            {ANALYSIS_LOADING_STEPS[currentStep].subtitle}
          </ThemedText>
        </View>

        {/* Progress Bar */}
        <LoadingProgressBar
          currentStep={currentStep + 1}
          totalSteps={ANALYSIS_LOADING_STEPS.length}
          progressWidth={progressWidth}
        />
      </View>

      {/* Bottom Tip */}
      <View style={styles.tipWrapper}>
        <InfoBanner text="Analyzing your conversation..." />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  tipWrapper: {
    marginTop: 24,
  },
})
