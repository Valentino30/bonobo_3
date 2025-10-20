import { Animated, Pressable, type PressableProps, type ViewStyle } from 'react-native'
import { useCardAnimation, type CardAnimationConfig } from '@/hooks/use-card-animation'
import { type ReactNode } from 'react'

interface AnimatedCardProps extends Omit<PressableProps, 'style' | 'onPressIn' | 'onPressOut'> {
  /** Child components to render inside the animated card */
  children: ReactNode
  /** Optional style for the Pressable wrapper */
  style?: ViewStyle | ViewStyle[]
  /** Optional style for the Animated.View container */
  containerStyle?: ViewStyle | ViewStyle[]
  /** Animation configuration (uses sensible defaults if not provided) */
  animationConfig?: CardAnimationConfig
  /** Custom onPressIn handler (will be called after animation) */
  onPressIn?: () => void
  /** Custom onPressOut handler (will be called after animation) */
  onPressOut?: () => void
}

/**
 * Wrapper component that adds scale and shake animations to any card-like component
 * Eliminates the need to manually wire up animation hooks and transforms
 *
 * @example
 * ```tsx
 * // Simple usage with default animations
 * <AnimatedCard onPress={() => console.log('pressed')}>
 *   <View style={styles.card}>
 *     <Text>My Card Content</Text>
 *   </View>
 * </AnimatedCard>
 *
 * // Custom animation config
 * <AnimatedCard
 *   animationConfig={{ entranceAnimation: false, pressScale: 0.95 }}
 *   onPress={handlePress}
 * >
 *   <MyCardComponent />
 * </AnimatedCard>
 * ```
 */
export function AnimatedCard({
  children,
  style,
  containerStyle,
  animationConfig,
  onPressIn: customOnPressIn,
  onPressOut: customOnPressOut,
  ...pressableProps
}: AnimatedCardProps) {
  const { scale, shake, rotate, handlePressIn, handlePressOut } = useCardAnimation(animationConfig)

  const handlePressInWrapper = () => {
    handlePressIn()
    customOnPressIn?.()
  }

  const handlePressOutWrapper = () => {
    handlePressOut()
    customOnPressOut?.()
  }

  return (
    <Pressable style={style} onPressIn={handlePressInWrapper} onPressOut={handlePressOutWrapper} {...pressableProps}>
      <Animated.View
        style={[
          containerStyle,
          {
            transform: [{ scale }, { translateX: shake }, { rotate }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  )
}
