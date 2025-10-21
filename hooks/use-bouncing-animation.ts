import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

interface UseBouncingAnimationOptions {
  dotCount?: number
  bounceHeight?: number
  bounceDuration?: number
  staggerDelay?: number
}

export function useBouncingAnimation(options: UseBouncingAnimationOptions = {}) {
  const {
    dotCount = 3,
    bounceHeight = -3,
    bounceDuration = 300,
    staggerDelay = 200,
  } = options

  const animatedValues = useRef(
    Array.from({ length: dotCount }, () => new Animated.Value(0))
  ).current

  useEffect(() => {
    const createBounceAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: bounceHeight,
          duration: bounceDuration,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: bounceDuration,
          useNativeDriver: true,
        }),
      ])
    }

    const animations = animatedValues.map((animatedValue, index) =>
      createBounceAnimation(animatedValue, index * staggerDelay)
    )

    const animation = Animated.loop(Animated.parallel(animations))

    animation.start()

    return () => animation.stop()
  }, [animatedValues, bounceHeight, bounceDuration, staggerDelay])

  return animatedValues
}
