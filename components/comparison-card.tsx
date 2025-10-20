import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, View, Animated, Pressable } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { useState, useRef } from 'react'
import { useCardAnimation } from '@/hooks/use-card-animation'

interface ParticipantData {
  name: string
  value: string | number
  progressValue?: number
  progressColor?: string
}

interface ComparisonCardProps {
  title: string
  icon: string
  participants: ParticipantData[]
  description?: string
  index?: number
}

export function ComparisonCard({ title, icon, participants, description, index }: ComparisonCardProps) {
  const theme = useTheme()
  const [isFlipped, setIsFlipped] = useState(false)
  const flipAnimation = useRef(new Animated.Value(0)).current
  const entranceDelay = index !== undefined ? index * 80 : undefined
  const { scale, opacity, shake, rotate, handlePressIn, handlePressOut } = useCardAnimation({
    entranceAnimation: true,
    entranceDelay,
  })

  const handleFlip = () => {
    if (!description) return // Don't flip if no description

    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start()

    setIsFlipped(!isFlipped)
  }

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  })

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  }

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  }

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  })

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  })

  return (
    <Pressable
      onPress={handleFlip}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: '100%' }}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [{ scale }, { translateX: shake }, { rotate }],
          },
        ]}
      >
        {/* Front of card */}
        <Animated.View
          style={[
            styles.cardFace,
            frontAnimatedStyle,
            { opacity: frontOpacity },
            isFlipped && styles.hiddenFace,
          ]}
        >
          <ThemedView
            style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.backgroundLight,
                borderColor: theme.colors.borderLight,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View style={styles.titleRow}>
              <ThemedText style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{title}</ThemedText>
              <ThemedText style={styles.iconText}>{icon}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.backgroundSecondary }]} />
            <View style={styles.participantRow}>
              {participants.map((participant, index) => (
                <View key={index} style={styles.participantItem}>
                  <ThemedText style={[styles.participantName, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                    {participant.name}
                  </ThemedText>
                  <ThemedText style={[styles.participantNumber, { color: theme.colors.text }]}>
                    {participant.value}
                  </ThemedText>
                  {participant.progressValue !== undefined && (
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${participant.progressValue}%`,
                            backgroundColor: participant.progressColor || theme.colors.info,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ThemedView>
        </Animated.View>

        {/* Back of card */}
        {description && (
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              backAnimatedStyle,
              { opacity: backOpacity },
              !isFlipped && styles.hiddenFace,
            ]}
          >
            <ThemedView
              style={[
                styles.statCard,
                styles.backCard,
                {
                  backgroundColor: theme.colors.backgroundLight,
                  borderColor: theme.colors.borderLight,
                  shadowColor: theme.colors.shadow,
                },
              ]}
            >
              <ThemedText style={[styles.descriptionLarge, { color: theme.colors.text }]}>{description}</ThemedText>
              <ThemedText style={[styles.tapHint, { color: theme.colors.textTertiary }]}>Tap to see stats</ThemedText>
            </ThemedView>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 200,
    marginBottom: 12,
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
    height: '100%',
  },
  hiddenFace: {
    pointerEvents: 'none',
  },
  statCard: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    height: '100%',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  backCard: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  flipHint: {
    fontSize: 16,
    opacity: 0.5,
  },
  iconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 24,
  },
  participantItem: {
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  participantNumber: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  descriptionLarge: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tapHint: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
})
