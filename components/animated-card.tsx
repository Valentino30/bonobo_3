import { type ReactNode } from 'react'

import { Animated, Pressable, type PressableProps, type ViewStyle } from 'react-native'

import { type CardAnimationConfig, useCardAnimation } from '@/hooks/use-card-animation'

interface AnimatedCardProps extends Omit<PressableProps, 'style' | 'onPressIn' | 'onPressOut'> {
  children: ReactNode
  style?: ViewStyle | ViewStyle[]
  containerStyle?: ViewStyle | ViewStyle[]
  animationConfig?: CardAnimationConfig
  index?: number
  onPressIn?: () => void
  onPressOut?: () => void
}

/** Stagger delay in milliseconds between each card animation */
const STAGGER_DELAY_MS = 80

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
  index,
  onPressIn: customOnPressIn,
  onPressOut: customOnPressOut,
  ...pressableProps
}: AnimatedCardProps) {
  const entranceDelay = index !== undefined ? index * STAGGER_DELAY_MS : undefined

  const { scale, opacity, shake, rotate, handlePressIn, handlePressOut } = useCardAnimation({
    ...animationConfig,
    entranceDelay,
  })

  const handlePressInWrapper = () => {
    handlePressIn()
    customOnPressIn?.()
  }

  const handlePressOutWrapper = () => {
    handlePressOut()
    customOnPressOut?.()
  }

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX: shake }],
      }}
    >
      <Pressable style={style} onPressIn={handlePressInWrapper} onPressOut={handlePressOutWrapper} {...pressableProps}>
        <Animated.View
          style={[
            containerStyle,
            {
              transform: [{ scale }, { rotate }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}
