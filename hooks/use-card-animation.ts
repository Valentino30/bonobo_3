import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'

export type CardAnimationConfig = {
  /** Enable entrance animation on mount */
  entranceAnimation?: boolean
  /** Scale amount for entrance bounce (e.g., 1.02) */
  entranceScale?: number
  /** Shake distance in pixels for entrance (e.g., 2) */
  entranceShake?: number
  /** Scale amount when pressed (e.g., 0.96) */
  pressScale?: number
  /** Spring damping for press animation */
  springDamping?: number
  /** Spring stiffness for press animation */
  springStiffness?: number
}

export type CardAnimationResult = {
  /** Animated value for scale transform */
  scaleAnim: Animated.Value
  /** Animated value for shake transform (translateX) */
  shakeAnim: Animated.Value
  /** Call when press starts */
  handlePressIn: () => void
  /** Call when press ends */
  handlePressOut: () => void
  /** Interpolated translateX value for shake */
  translateX: Animated.AnimatedInterpolation<number>
}

/**
 * Custom hook for card entrance and press animations
 * Provides scale and shake effects for interactive cards
 *
 * @example
 * ```tsx
 * const { scaleAnim, translateX, handlePressIn, handlePressOut } = useCardAnimation({
 *   entranceAnimation: true,
 *   pressScale: 0.96
 * })
 *
 * <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateX }] }}>
 *   <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
 *     ...
 *   </Pressable>
 * </Animated.View>
 * ```
 */
export function useCardAnimation(config: CardAnimationConfig = {}): CardAnimationResult {
  const {
    entranceAnimation = true,
    entranceScale = 1.02,
    entranceShake = 2,
    pressScale = 0.96,
    springDamping = 15,
    springStiffness = 200,
  } = config

  const scaleAnim = useRef(new Animated.Value(1)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

  // Entrance animation - subtle scale and shake on mount
  useEffect(() => {
    if (!entranceAnimation) return

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: entranceScale,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: entranceShake,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -entranceShake,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [scaleAnim, shakeAnim, entranceAnimation, entranceScale, entranceShake])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: pressScale,
      useNativeDriver: true,
      damping: springDamping,
      stiffness: springStiffness,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: springDamping,
      stiffness: springStiffness,
    }).start()
  }

  const translateX = shakeAnim.interpolate({
    inputRange: [-entranceShake, 0, entranceShake],
    outputRange: [-entranceShake, 0, entranceShake],
  })

  return {
    scaleAnim,
    shakeAnim,
    handlePressIn,
    handlePressOut,
    translateX,
  }
}
