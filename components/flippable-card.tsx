import { Animated, StyleSheet, View } from 'react-native'
import { useRef, useState } from 'react'
import { AnimatedCard } from '@/components/animated-card'
import { useFlipAnimation } from '@/hooks/use-flip-animation'
import { type ReactNode } from 'react'

interface FlippableCardProps {
  front: ReactNode
  back: ReactNode
  index?: number
  containerStyle?: any
  height?: number
  onFlip?: (isFlipped: boolean) => void
}

/**
 * Reusable flippable card component with entrance and flip animations
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
  const [containerHeight, setContainerHeight] = useState<number | undefined>(height)
  const frontHeightRef = useRef<number>(0)
  const backHeightRef = useRef<number>(0)

  const { isFlipped, handleFlip, frontAnimatedStyle, backAnimatedStyle, frontOpacity, backOpacity } = useFlipAnimation({
    onFlip,
  })

  return (
    <AnimatedCard
      onPress={handleFlip}
      index={index}
      containerStyle={[styles.container, containerStyle, { height: containerHeight }]}
    >
      <View style={{ width: '100%', height: '100%' }}>
        {/* Front of card */}
        <Animated.View
          style={[
            styles.cardFace,
            frontAnimatedStyle,
            { opacity: frontOpacity },
            isFlipped && styles.hiddenFace,
          ]}
          onLayout={(event) => {
            if (height === undefined) {
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
          style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            { opacity: backOpacity },
            !isFlipped && styles.hiddenFace,
          ]}
          onLayout={(event) => {
            if (height === undefined) {
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
