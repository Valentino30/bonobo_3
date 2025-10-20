import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { Animated, StyleSheet } from 'react-native'

type AnimatedIconProps = {
  /** Icon name from MaterialCommunityIcons */
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  /** Size of the icon */
  iconSize?: number
  /** Size of the container (width and height) */
  containerSize?: number
  /** Animated value for pulse/scale effect */
  pulseAnim?: Animated.Value
  /** Icon color (defaults to theme primary) */
  iconColor?: string
  /** Background color (defaults to theme backgroundInfo) */
  backgroundColor?: string
  /** Border color (defaults to theme primaryLighter) */
  borderColor?: string
}

/**
 * Animated circular icon with pulse effect
 * Perfect for loading states, status indicators, or drawing attention
 */
export function AnimatedIcon({
  icon,
  iconSize = 56,
  containerSize = 96,
  pulseAnim,
  iconColor,
  backgroundColor,
  borderColor,
}: AnimatedIconProps) {
  const theme = useTheme()

  const finalIconColor = iconColor || theme.colors.primary
  const finalBackgroundColor = backgroundColor || theme.colors.backgroundInfo
  const finalBorderColor = borderColor || theme.colors.primaryLighter

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
          transform: pulseAnim ? [{ scale: pulseAnim }] : undefined,
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
