import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'

export type CardAnimationConfig = {
  /** Enable entrance animation on mount */
  entranceAnimation?: boolean
  /** Entrance animation delay (ms) - useful for staggered list animations */
  entranceDelay?: number
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
  /** Animated value for opacity (fade-in effect) */
  opacity: Animated.Value
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
    entranceDelay = 0,
    pressScale = 0.96,
    springDamping = 15,
    springStiffness = 200,
    enablePressShake = true,
    pressShakeDelay = 200,
    pressShakeIntensity = 1,
  } = config

  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(entranceAnimation ? -30 : 0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null)

  // Entrance animation - simple slide in from left
  useEffect(() => {
    if (!entranceAnimation) return

    const timeout = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start()
    }, entranceDelay)

    return () => clearTimeout(timeout)
  }, [slideAnim, entranceAnimation, entranceDelay])

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

  // Combine slide entrance with press shake
  const shake = Animated.add(
    slideAnim,
    shakeAnim.interpolate({
      inputRange: [-pressShakeIntensity, 0, pressShakeIntensity],
      outputRange: [-2, 0, 2],
    })
  )

  const rotate = shakeAnim.interpolate({
    inputRange: [-pressShakeIntensity, 0, pressShakeIntensity],
    outputRange: ['-1deg', '0deg', '1deg'],
  })

  return {
    scale: scaleAnim,
    opacity: opacityAnim,
    shake,
    rotate,
    handlePressIn,
    handlePressOut,
  }
}
