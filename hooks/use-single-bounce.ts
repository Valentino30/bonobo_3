import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

interface UseSingleBounceOptions {
  distance?: number
  duration?: number
}

/**
 * Hook for creating a single element bouncing animation
 * Returns an animated value that bounces up and down continuously
 *
 * @param options - Configuration for the bounce animation
 * @param options.distance - How far to bounce (default: -10)
 * @param options.duration - Duration of each bounce direction in ms (default: 600)
 *
 * @example
 * ```tsx
 * const bounceAnim = useSingleBounce({ distance: -15, duration: 500 })
 *
 * <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
 *   <Icon />
 * </Animated.View>
 * ```
 */
export function useSingleBounce({ distance = -10, duration = 600 }: UseSingleBounceOptions = {}) {
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [bounceAnim, distance, duration])

  return bounceAnim
}
