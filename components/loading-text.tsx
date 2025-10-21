import { View, Animated, StyleSheet, TextStyle } from 'react-native'
import { useBouncingAnimation } from '@/hooks/use-bouncing-animation'

interface LoadingTextProps {
  color: string
  dotCount?: number
  bounceHeight?: number
  bounceDuration?: number
  staggerDelay?: number
  dotStyle?: TextStyle
}

export const LoadingText: React.FC<LoadingTextProps> = ({
  color,
  dotCount = 3,
  bounceHeight = -3,
  bounceDuration = 300,
  staggerDelay = 200,
  dotStyle,
}) => {
  const bounceValues = useBouncingAnimation({
    dotCount,
    bounceHeight,
    bounceDuration,
    staggerDelay,
  })

  return (
    <View style={styles.container}>
      {bounceValues.map((bounceValue, index) => (
        <Animated.Text key={index} style={[styles.dot, dotStyle, { color, transform: [{ translateY: bounceValue }] }]}>
          .
        </Animated.Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: 16,
    fontWeight: '600',
  },
})
