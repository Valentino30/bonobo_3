import { Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { useFlipAnimation } from '@/hooks/use-flip-animation'
import { type ReactNode } from 'react'

interface FlippableCardProps {
  front: ReactNode
  back: ReactNode
  onFlip?: (isFlipped: boolean) => void
  style?: ViewStyle | ViewStyle[]
}

/**
 * Simple flippable card component that handles flip animation between two children
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
export function FlippableCard({ front, back, onFlip, style }: FlippableCardProps) {
  const { isFlipped, handleFlip, frontAnimatedStyle, backAnimatedStyle, frontOpacity, backOpacity } = useFlipAnimation({
    onFlip,
  })

  return (
    <Pressable onPress={handleFlip} style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.cardFace,
          frontAnimatedStyle,
          { opacity: frontOpacity },
          isFlipped && styles.hiddenFace,
        ]}
      >
        {front}
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
        {back}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
