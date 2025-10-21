import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'

interface UsePulseAnimationOptions {
  scale?: number
  duration?: number
}

/**
 * Hook for creating a pulsating scale animation
 * Returns an animated value that pulses between 1 and the specified scale
 *
 * @param options - Configuration for the pulse animation
 * @param options.scale - Target scale value (default: 1.15)
 * @param options.duration - Duration of each pulse direction in ms (default: 900)
 *
 * @example
 * ```tsx
 * const pulseAnim = usePulseAnimation({ scale: 1.2, duration: 800 })
 *
 * <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
 *   <Icon />
 * </Animated.View>
 * ```
 */
export function usePulseAnimation({ scale = 1.15, duration = 900 }: UsePulseAnimationOptions = {}) {
  const [pulseAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: scale,
          duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim, scale, duration])

  return pulseAnim
}
