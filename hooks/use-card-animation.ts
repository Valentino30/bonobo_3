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
  /** Enable delayed shake loop on long press */
  enablePressShake?: boolean
  /** Delay before shake starts on press (ms) */
  pressShakeDelay?: number
  /** Shake intensity for press shake (e.g., 1 for subtle, 2 for more) */
  pressShakeIntensity?: number
}

export type CardAnimationResult = {
  /** Animated value for scale transform */
  scale: Animated.Value
  /** Interpolated translateX value for horizontal shake/jiggle */
  shake: Animated.AnimatedInterpolation<number>
  /** Interpolated rotate value for shake/jiggle rotation */
  rotate: Animated.AnimatedInterpolation<string>
  /** Call when press starts */
  handlePressIn: () => void
  /** Call when press ends */
  handlePressOut: () => void
}

/**
 * Custom hook for card entrance and press animations
 * Provides scale and shake effects for interactive cards
 *
 * @example
 * ```tsx
 * // Simple entrance animation (chat cards)
 * const { scale, shake, handlePressIn, handlePressOut } = useCardAnimation()
 *
 * // Press shake animation (flippable cards)
 * const { scale, shake, rotate, handlePressIn, handlePressOut } = useCardAnimation({
 *   entranceAnimation: false
 * })
 *
 * <Animated.View style={{ transform: [{ scale }, { translateX: shake }, { rotate }] }}>
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
    enablePressShake = true,
    pressShakeDelay = 200,
    pressShakeIntensity = 1,
  } = config

  const scaleAnim = useRef(new Animated.Value(1)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null)

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

  const startShake = () => {
    shakeLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: pressShakeIntensity,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -pressShakeIntensity,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: pressShakeIntensity,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    )
    shakeLoopRef.current.start()
  }

  const stopShake = () => {
    if (shakeLoopRef.current) {
      shakeLoopRef.current.stop()
      shakeLoopRef.current = null
    }
    shakeAnim.stopAnimation()
    Animated.timing(shakeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }

  const handlePressIn = () => {
    // Scale down immediately
    Animated.spring(scaleAnim, {
      toValue: pressScale,
      useNativeDriver: true,
      damping: springDamping,
      stiffness: springStiffness,
    }).start()

    // Start shake after delay if enabled
    if (enablePressShake) {
      pressTimer.current = setTimeout(() => {
        startShake()
      }, pressShakeDelay)
    }
  }

  const handlePressOut = () => {
    // Clear the timer if released before shake starts
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }

    // Stop shake if running
    if (enablePressShake) {
      stopShake()
    }

    // Scale back to normal
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: springDamping,
      stiffness: springStiffness,
    }).start()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
      }
      if (shakeLoopRef.current) {
        shakeLoopRef.current.stop()
      }
      shakeAnim.stopAnimation()
    }
  }, [shakeAnim])

  const maxShakeValue = enablePressShake ? pressShakeIntensity : entranceShake

  const shake = shakeAnim.interpolate({
    inputRange: [-maxShakeValue, 0, maxShakeValue],
    outputRange: [-2, 0, 2],
  })

  const rotate = shakeAnim.interpolate({
    inputRange: [-maxShakeValue, 0, maxShakeValue],
    outputRange: ['-1deg', '0deg', '1deg'],
  })

  return {
    scale: scaleAnim,
    shake,
    rotate,
    handlePressIn,
    handlePressOut,
  }
}
