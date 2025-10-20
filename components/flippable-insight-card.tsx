import { useTheme } from '@/contexts/theme-context'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRef, useState } from 'react'
import { useCardAnimation } from '@/hooks/use-card-animation'

interface FlippableInsightCardProps {
  title: string
  icon?: string
  value?: string | number
  description?: string
  items?: string[]
  badge?: {
    text: string
    color: string
  }
  color?: string
  explanationTitle: string
  explanationText: string
  index?: number
}

/**
 * Interactive insight card with flip animation
 * Press to flip and see a simple explanation of the insight
 */
export function FlippableInsightCard({
  title,
  icon,
  value,
  description,
  items,
  badge,
  color,
  explanationTitle,
  explanationText,
  index,
}: FlippableInsightCardProps) {
  const theme = useTheme()
  const itemColor = color || theme.colors.primary
  const [isFlipped, setIsFlipped] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)
  const frontHeightRef = useRef<number>(0)
  const backHeightRef = useRef<number>(0)
  const flipAnimation = useRef(new Animated.Value(0)).current
  const entranceDelay = index !== undefined ? index * 80 : undefined
  const { scale, opacity, shake, rotate, handlePressIn, handlePressOut } = useCardAnimation({
    entranceAnimation: true,
    entranceDelay,
  })

  const handleFlip = () => {
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
    <Pressable onPress={handleFlip} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ width: '100%' }}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [{ scale }, { translateX: shake }, { rotate }],
            height: containerHeight,
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
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
              containerHeight ? { height: containerHeight } : undefined,
            ]}
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height
              if (height > 0 && frontHeightRef.current === 0) {
                frontHeightRef.current = height
                if (backHeightRef.current > 0) {
                  setContainerHeight(Math.max(frontHeightRef.current, backHeightRef.current, 300))
                }
              }
            }}
          >
            {/* Header Section with Divider */}
            <View style={styles.headerSection}>
              <View style={styles.header}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                {badge && (
                  <View style={[styles.badge, { backgroundColor: `${badge.color}20` }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Content Section */}
            <View style={styles.content}>
              <View>
                {value && <Text style={[styles.value, { color: itemColor }]}>{value}</Text>}
                {description && (
                  <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    {typeof description === 'string' ? description : JSON.stringify(description)}
                  </Text>
                )}

                {items && items.length > 0 && (
                  <View style={[styles.itemsList, !description && styles.itemsListNoDescription]}>
                    {items.map((item, index) => {
                      const itemText = typeof item === 'string' ? item : JSON.stringify(item)

                      return (
                        <View key={index} style={styles.itemRow}>
                          <View style={[styles.bullet, { backgroundColor: itemColor }]} />
                          <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>{itemText}</Text>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>

              {/* Flip hint */}
              <View style={styles.flipHintContainer}>
                <Text style={[styles.flipHint, { color: theme.colors.textSecondary }]}>Tap to learn more 💡</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Back of card */}
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
            style={[
              styles.card,
              { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
              containerHeight ? { height: containerHeight } : undefined,
            ]}
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height
              if (height > 0 && backHeightRef.current === 0) {
                backHeightRef.current = height
                if (frontHeightRef.current > 0) {
                  setContainerHeight(Math.max(frontHeightRef.current, backHeightRef.current, 300))
                }
              }
            }}
          >
            {/* Back content - centered layout */}
            <View style={styles.backContent}>
              <View style={styles.backCenterSection}>
                {icon && <Text style={styles.backIcon}>{icon}</Text>}
                <Text style={[styles.backTitle, { color: theme.colors.text }]}>{explanationTitle}</Text>
                <Text style={[styles.backDescription, { color: theme.colors.textSecondary }]}>
                  {explanationText}
                </Text>
              </View>

              {/* Flip hint */}
              <View style={styles.flipHintContainer}>
                <Text style={[styles.flipHint, { color: theme.colors.textSecondary }]}>Tap to flip back ↩️</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    marginBottom: 16,
    minHeight: 300,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  card: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
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
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    marginTop: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  itemsList: {
    marginTop: 0,
  },
  itemsListNoDescription: {
    marginTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  flipHintContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  flipHint: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
  },
  backContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  backCenterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  backTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  backDescription: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: 'center',
    width: '100%',
  },
})
