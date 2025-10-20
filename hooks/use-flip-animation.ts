import { useRef, useState } from 'react'
import { Animated } from 'react-native'

interface UseFlipAnimationOptions {
  friction?: number
  tension?: number
  onFlip?: (isFlipped: boolean) => void
}

interface FlipAnimationResult {
  isFlipped: boolean
  flipAnimation: Animated.Value
  handleFlip: () => void
  frontAnimatedStyle: { transform: { rotateY: Animated.AnimatedInterpolation<string | number> }[] }
  backAnimatedStyle: { transform: { rotateY: Animated.AnimatedInterpolation<string | number> }[] }
  frontOpacity: Animated.AnimatedInterpolation<number>
  backOpacity: Animated.AnimatedInterpolation<number>
}

/**
 * Hook for managing flip card animations
 * Returns flip state, animation values, and interpolated styles for front/back
 *
 * @param options - Configuration for the flip animation
 * @param options.friction - Spring friction (default: 8)
 * @param options.tension - Spring tension (default: 10)
 * @param options.onFlip - Callback when card flips
 *
 * @example
 * ```tsx
 * const { isFlipped, handleFlip, frontAnimatedStyle, backAnimatedStyle, frontOpacity, backOpacity } = useFlipAnimation()
 *
 * <Animated.View style={[frontAnimatedStyle, { opacity: frontOpacity }]}>
 *   <FrontContent />
 * </Animated.View>
 * <Animated.View style={[backAnimatedStyle, { opacity: backOpacity }]}>
 *   <BackContent />
 * </Animated.View>
 * ```
 */
export function useFlipAnimation({
  friction = 8,
  tension = 10,
  onFlip,
}: UseFlipAnimationOptions = {}): FlipAnimationResult {
  const [isFlipped, setIsFlipped] = useState(false)
  const flipAnimation = useRef(new Animated.Value(0)).current

  const handleFlip = () => {
    const newFlippedState = !isFlipped

    Animated.spring(flipAnimation, {
      toValue: newFlippedState ? 1 : 0,
      friction,
      tension,
      useNativeDriver: true,
    }).start()

    setIsFlipped(newFlippedState)
    onFlip?.(newFlippedState)
  }

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  })

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  }

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  }

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  })

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  })

  return {
    isFlipped,
    flipAnimation,
    handleFlip,
    frontAnimatedStyle,
    backAnimatedStyle,
    frontOpacity,
    backOpacity,
  }
}
