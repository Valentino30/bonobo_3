import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'

const STEPS = [
  {
    title: 'Reading Messages',
    subtitle: 'Parsing conversation data',
    icon: 'message-text' as const,
  },
  {
    title: 'Calculating Stats',
    subtitle: 'Analyzing patterns',
    icon: 'chart-line' as const,
  },
  {
    title: 'Generating Insights',
    subtitle: 'Preparing your results',
    icon: 'lightbulb-on-outline' as const,
  },
]

export function AnalysisLoading({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  console.log('AnalysisLoading: currentStep', currentStep)
  const [pulseAnim] = useState(new Animated.Value(1))
  const [progressAnim] = useState(new Animated.Value(0))

  // Pulse animation for the icon - smooth and steady
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Progress animation - matches step duration for smooth transition
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / STEPS.length,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Step advancement - each step shows for exactly 2000ms
  useEffect(() => {
    const STEP_DURATION = 2000

    if (currentStep < STEPS.length - 1) {
      console.log('AnalysisLoading: advancing to step', currentStep + 1)
      const timeout = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, STEP_DURATION)
      return () => clearTimeout(timeout)
    } else {
      // Call onComplete after last step is shown for the same duration
      console.log('AnalysisLoading: completed all steps, calling onComplete')
      if (onComplete) {
        const completeTimeout = setTimeout(() => {
          onComplete()
        }, STEP_DURATION)
        return () => clearTimeout(completeTimeout)
      }
    }
  }, [currentStep, onComplete])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.container}>
      {/* Main Content Card */}
      <View style={styles.card}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name={STEPS[currentStep].icon} size={56} color="#6B8E5A" />
        </Animated.View>

        {/* Title and Subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{STEPS[currentStep].title}</Text>
          <Text style={styles.subtitle}>{STEPS[currentStep].subtitle}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {STEPS.length}
          </Text>
        </View>
      </View>

      {/* Bottom Tip */}
      <View style={styles.tipContainer}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#6B8E5A" />
        <Text style={styles.tipText}>Analyzing your conversation...</Text>
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
    backgroundColor: '#FAFAFA',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5F9F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D5E3CE',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6B8E5A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B8E5A',
    letterSpacing: 0.5,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F9F3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E3CE',
  },
  tipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C6B63',
    letterSpacing: 0.2,
  },
})
