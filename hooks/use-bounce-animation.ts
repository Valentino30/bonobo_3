import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

interface UseBounceAnimationOptions {
  distance?: number
  duration?: number
}

/**
 * Hook for creating a bouncing animation
 * Returns an animated value that bounces up and down continuously
 *
 * @param options - Configuration for the bounce animation
 * @param options.distance - How far to bounce (default: -10)
 * @param options.duration - Duration of each bounce direction in ms (default: 600)
 *
 * @example
 * ```tsx
 * const bounceAnim = useBounceAnimation({ distance: -15, duration: 500 })
 *
 * <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
 *   <Icon />
 * </Animated.View>
 * ```
 */
export function useBounceAnimation({ distance = -10, duration = 600 }: UseBounceAnimationOptions = {}) {
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
