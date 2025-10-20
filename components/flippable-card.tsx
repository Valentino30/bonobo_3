import { Animated, StyleSheet, View } from 'react-native'
import { useRef, useState } from 'react'
import { AnimatedCard } from '@/components/animated-card'
import { type ReactNode } from 'react'

interface FlippableCardProps {
  /** Content to show on the front of the card */
  front: ReactNode
  /** Content to show on the back of the card */
  back: ReactNode
  /** Index for staggered entrance animations */
  index?: number
  /** Additional styles for the card container */
  containerStyle?: any
  /** Fixed height for the card (optional) */
  height?: number
  /** Callback when card is flipped */
  onFlip?: (isFlipped: boolean) => void
}

/**
 * Reusable flippable card component with entrance animations
 * Wraps content in a flip animation that shows front and back
 *
 * @example
 * ```tsx
 * <FlippableCard
 *   front={<MyFrontContent />}
 *   back={<MyBackContent />}
 *   index={0}
 * />
 * ```
 */
export function FlippableCard({ front, back, index, containerStyle, height, onFlip }: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number | undefined>(height)
  const frontHeightRef = useRef<number>(0)
  const backHeightRef = useRef<number>(0)
  const flipAnimation = useRef(new Animated.Value(0)).current

  const handleFlip = () => {
    const newFlippedState = !isFlipped

    Animated.spring(flipAnimation, {
      toValue: newFlippedState ? 1 : 0,
      friction: 8,
      tension: 10,
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

  return (
    <AnimatedCard onPress={handleFlip} index={index} containerStyle={[styles.container, containerStyle, { height: containerHeight }]}>
      <View style={styles.innerContainer}>
        {/* Front of card */}
        <Animated.View
          style={[styles.cardFace, frontAnimatedStyle, { opacity: frontOpacity }, isFlipped && styles.hiddenFace]}
          onLayout={(event) => {
            if (!height) {
              const layoutHeight = event.nativeEvent.layout.height
              if (layoutHeight > 0 && frontHeightRef.current === 0) {
                frontHeightRef.current = layoutHeight
                if (backHeightRef.current > 0) {
                  setContainerHeight(Math.max(frontHeightRef.current, backHeightRef.current))
                }
              }
            }
          }}
        >
          {front}
        </Animated.View>

        {/* Back of card */}
        <Animated.View
          style={[styles.cardFace, styles.cardBack, backAnimatedStyle, { opacity: backOpacity }, !isFlipped && styles.hiddenFace]}
          onLayout={(event) => {
            if (!height) {
              const layoutHeight = event.nativeEvent.layout.height
              if (layoutHeight > 0 && backHeightRef.current === 0) {
                backHeightRef.current = layoutHeight
                if (frontHeightRef.current > 0) {
                  setContainerHeight(Math.max(frontHeightRef.current, backHeightRef.current))
                }
              }
            }
          }}
        >
          {back}
        </Animated.View>
      </View>
    </AnimatedCard>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hiddenFace: {
    pointerEvents: 'none',
  },
})
