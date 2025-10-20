import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import { useFlipAnimation } from '@/hooks/use-flip-animation'
import { type ReactNode, useRef, useState } from 'react'

interface FlippableCardProps {
  front: ReactNode
  back: ReactNode
  onFlip?: (isFlipped: boolean) => void
  style?: ViewStyle | ViewStyle[]
  minHeight?: number
}

/**
 * Flippable card component with automatic height management
 * Measures both front and back content and sets container height to the maximum
 * Does not include entrance or press animations - wrap with AnimatedCard if needed
 *
 * @example
 * ```tsx
 * <FlippableCard
 *   front={<FrontContent />}
 *   back={<BackContent />}
 * />
 * ```
 */
export function FlippableCard({ front, back, onFlip, style, minHeight = 300 }: FlippableCardProps) {
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)
  const frontHeightRef = useRef<number>(0)
  const backHeightRef = useRef<number>(0)

  const { isFlipped, handleFlip, frontAnimatedStyle, backAnimatedStyle, frontOpacity, backOpacity } = useFlipAnimation({
    onFlip,
  })

  const handleFrontLayout = (event: any) => {
    const height = event.nativeEvent.layout.height
    if (height > 0 && frontHeightRef.current === 0) {
      frontHeightRef.current = height
      if (backHeightRef.current > 0) {
        setContainerHeight(Math.max(frontHeightRef.current, backHeightRef.current, minHeight))
      }
    }
  }

  const handleBackLayout = (event: any) => {
    const height = event.nativeEvent.layout.height
    if (height > 0 && backHeightRef.current === 0) {
      backHeightRef.current = height
      if (frontHeightRef.current > 0) {
        setContainerHeight(Math.max(frontHeightRef.current, backHeightRef.current, minHeight))
      }
    }
  }

  return (
    <Pressable onPress={handleFlip} style={[styles.container, style]}>
      <View style={[styles.contentWrapper, containerHeight ? { height: containerHeight } : undefined]}>
        <Animated.View
          style={[
            styles.cardFace,
            frontAnimatedStyle,
            { opacity: frontOpacity },
            isFlipped && styles.hiddenFace,
          ]}
        >
          <View
            style={containerHeight ? { height: containerHeight } : undefined}
            onLayout={handleFrontLayout}
          >
            {front}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            { opacity: backOpacity },
            !isFlipped && styles.hiddenFace,
          ]}
        >
          <View
            style={containerHeight ? { height: containerHeight } : undefined}
            onLayout={handleBackLayout}
          >
            {back}
          </View>
        </Animated.View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    width: '100%',
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
