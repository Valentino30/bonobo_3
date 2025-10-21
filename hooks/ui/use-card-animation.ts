import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'

export type CardAnimationConfig = {
  entranceAnimation?: boolean
  fadeInAnimation?: boolean
  scaleInAnimation?: boolean
  entranceDelay?: number
  pressScale?: number
  springDamping?: number
  springStiffness?: number
  enablePressShake?: boolean
  pressShakeDelay?: number
  pressShakeIntensity?: number
}

export type CardAnimationResult = {
  scale: Animated.AnimatedMultiplication<number> | Animated.Value
  opacity: Animated.Value
  slideY: Animated.Value
  shake: Animated.AnimatedInterpolation<number>
  rotate: Animated.AnimatedInterpolation<string>
  handlePressIn: () => void
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
    fadeInAnimation = false,
    scaleInAnimation = false,
    entranceDelay = 0,
    pressScale = 0.96,
    springDamping = 15,
    springStiffness = 200,
    enablePressShake = true,
    pressShakeDelay = 200,
    pressShakeIntensity = 1,
  } = config

  const pressScaleAnim = useRef(new Animated.Value(1)).current
  const entranceScaleAnim = useRef(new Animated.Value(scaleInAnimation ? 0.8 : 1)).current
  const opacityAnim = useRef(new Animated.Value(fadeInAnimation ? 0 : 1)).current
  const slideAnim = useRef(new Animated.Value(entranceAnimation ? -30 : 0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null)

  // Entrance animation - slide from top (no opacity to avoid shadow artifacts)
  useEffect(() => {
    if (!entranceAnimation) return

    const timeout = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    }, entranceDelay)

    return () => clearTimeout(timeout)
  }, [slideAnim, entranceAnimation, entranceDelay])

  // Fade-in animation - can be used independently
  useEffect(() => {
    if (!fadeInAnimation) return

    const timeout = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start()
    }, entranceDelay)

    return () => clearTimeout(timeout)
  }, [opacityAnim, fadeInAnimation, entranceDelay])

  // Scale-in animation - can be used independently (avoids shadow artifacts from opacity)
  useEffect(() => {
    if (!scaleInAnimation) return

    const timeout = setTimeout(() => {
      Animated.spring(entranceScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }).start()
    }, entranceDelay)

    return () => clearTimeout(timeout)
  }, [entranceScaleAnim, scaleInAnimation, entranceDelay])

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
    Animated.spring(pressScaleAnim, {
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
    Animated.spring(pressScaleAnim, {
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

  // Separate shake from slide (shake is horizontal, slide is vertical)
  const shake = shakeAnim.interpolate({
    inputRange: [-pressShakeIntensity, 0, pressShakeIntensity],
    outputRange: [-2, 0, 2],
  })

  const rotate = shakeAnim.interpolate({
    inputRange: [-pressShakeIntensity, 0, pressShakeIntensity],
    outputRange: ['-1deg', '0deg', '1deg'],
  })

  // Combine entrance scale with press scale (multiply them together)
  const combinedScale = Animated.multiply(entranceScaleAnim, pressScaleAnim)

  return {
    scale: combinedScale,
    opacity: opacityAnim,
    slideY: slideAnim,
    shake,
    rotate,
    handlePressIn,
    handlePressOut,
  }
}
