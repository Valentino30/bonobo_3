import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'

export type LoadingAnimationConfig = {
  /** Number of steps in the loading sequence */
  stepCount: number
  /** Duration each step is displayed (in milliseconds) */
  stepDuration?: number
  /** Pulse animation scale target */
  pulseScale?: number
  /** Pulse animation duration (in milliseconds) */
  pulseDuration?: number
  /** Callback when all steps complete */
  onComplete?: () => void
}

export type LoadingAnimationResult = {
  /** Current step index (0-based) */
  currentStep: number
  /** Animated value for pulse effect (use with transform scale) */
  pulseAnim: Animated.Value
  /** Animated value for progress (0 to 1) */
  progressAnim: Animated.Value
  /** Interpolated progress width string ('0%' to '100%') */
  progressWidth: Animated.AnimatedInterpolation<string>
}

/**
 * Custom hook for multi-step loading animations
 * Handles pulse animation, progress bar, and step advancement
 *
 * @example
 * ```tsx
 * const { currentStep, pulseAnim, progressWidth } = useLoadingAnimation({
 *   stepCount: 3,
 *   stepDuration: 1000,
 *   onComplete: () => console.log('Done!')
 * })
 * ```
 */
export function useLoadingAnimation(config: LoadingAnimationConfig): LoadingAnimationResult {
  const { stepCount, stepDuration = 1000, pulseScale = 1.15, pulseDuration = 900, onComplete } = config

  const [currentStep, setCurrentStep] = useState(0)
  const [pulseAnim] = useState(new Animated.Value(1))
  const [progressAnim] = useState(new Animated.Value(0))

  // Pulse animation - smooth and steady loop
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: pulseScale,
          duration: pulseDuration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: pulseDuration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim, pulseScale, pulseDuration])

  // Progress animation - matches step duration for smooth transition
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / stepCount,
      duration: stepDuration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start()
  }, [currentStep, progressAnim, stepCount, stepDuration])

  // Step advancement - each step shows for the configured duration
  useEffect(() => {
    if (currentStep < stepCount - 1) {
      const timeout = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, stepDuration)
      return () => clearTimeout(timeout)
    } else {
      // Call onComplete after last step is shown for the same duration
      if (onComplete) {
        const completeTimeout = setTimeout(() => {
          onComplete()
        }, stepDuration)
        return () => clearTimeout(completeTimeout)
      }
    }
  }, [currentStep, stepCount, stepDuration, onComplete])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return {
    currentStep,
    pulseAnim,
    progressAnim,
    progressWidth,
  }
}
