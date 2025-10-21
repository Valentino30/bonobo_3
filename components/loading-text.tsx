import { View, Animated, StyleSheet, TextStyle, Text } from 'react-native'
import { useBouncingAnimation } from '@/hooks/use-bouncing-animation'

interface LoadingTextProps {
  text: string
  textStyle?: TextStyle
  color: string
  dotCount?: number
  bounceHeight?: number
  bounceDuration?: number
  staggerDelay?: number
  dotStyle?: TextStyle
}

export const LoadingText: React.FC<LoadingTextProps> = ({
  text,
  textStyle,
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
    <View style={styles.wrapper}>
      <Text style={[styles.text, textStyle, { color }]}>{text}</Text>
      <View style={styles.dotsContainer}>
        {bounceValues.map((bounceValue, index) => (
          <Animated.Text
            key={index}
            style={[styles.dot, dotStyle, { color, transform: [{ translateY: bounceValue }] }]}
          >
            .
          </Animated.Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: 16,
    fontWeight: '600',
  },
})
