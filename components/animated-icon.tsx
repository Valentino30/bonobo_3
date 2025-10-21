import { Animated, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { useSingleBounce } from '@/hooks/use-single-bounce'
import { usePulseAnimation } from '@/hooks/use-pulse-animation'

type AnimationType = 'bounce' | 'pulsate' | 'none'

type AnimatedIconProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  iconSize?: number
  containerSize?: number
  animation?: AnimationType
  iconColor?: string
  backgroundColor?: string
  borderColor?: string
}

/**
 * Animated circular icon with configurable animation type
 *
 * @example
 * ```tsx
 * // Bouncing icon
 * <AnimatedIcon icon="arrow-down" animation="bounce" />
 *
 * // Pulsating icon
 * <AnimatedIcon icon="check" animation="pulsate" />
 *
 * // Static icon
 * <AnimatedIcon icon="alert" animation="none" />
 * ```
 */
export function AnimatedIcon({
  icon,
  iconSize = 56,
  containerSize = 96,
  animation = 'none',
  iconColor,
  backgroundColor,
  borderColor,
}: AnimatedIconProps) {
  const theme = useTheme()
  const bounceAnim = useSingleBounce()
  const pulseAnim = usePulseAnimation()

  const finalIconColor = iconColor || theme.colors.primary
  const finalBackgroundColor = backgroundColor || theme.colors.backgroundInfo
  const finalBorderColor = borderColor || theme.colors.primaryLighter

  const animationTransforms = {
    bounce: [{ translateY: bounceAnim }],
    pulsate: [{ scale: pulseAnim }],
    none: undefined,
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: finalBackgroundColor,
          borderColor: finalBorderColor,
          transform: animationTransforms[animation],
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={finalIconColor} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
})
