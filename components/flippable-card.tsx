import { type ReactNode } from 'react'
import { Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { useFlipAnimation } from '@/hooks/use-flip-animation'

interface FlippableCardProps {
  front: ReactNode
  back: ReactNode
  onFlip?: (isFlipped: boolean) => void
  style?: ViewStyle | ViewStyle[]
  onPressIn?: () => void
  onPressOut?: () => void
}

/**
 * Simple flippable card component with flip animation
 * Uses fixed heights from parent components
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
export function FlippableCard({ front, back, onFlip, style, onPressIn, onPressOut }: FlippableCardProps) {
  const { isFlipped, handleFlip, frontAnimatedStyle, backAnimatedStyle, frontOpacity, backOpacity } = useFlipAnimation({
    onFlip,
  })

  return (
    <Pressable onPress={handleFlip} onPressIn={onPressIn} onPressOut={onPressOut} style={[styles.container, style]}>
      <Animated.View
        style={[styles.cardFace, frontAnimatedStyle, { opacity: frontOpacity }, isFlipped && styles.hiddenFace]}
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
  contentWrapper: {
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
