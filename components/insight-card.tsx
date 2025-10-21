import { Animated, StyleSheet, Text, View } from 'react-native'
import { AnimatedCard } from '@/components/animated-card'
import { FlippableCard } from '@/components/flippable-card'
import { useTheme } from '@/contexts/theme-context'
import { useCardAnimation } from '@/hooks/use-card-animation'

interface InsightCardProps {
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
  explanationTitle?: string
  explanationText?: string
  index?: number
  disableEntranceAnimation?: boolean
}

export function InsightCard({
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
  disableEntranceAnimation = false,
}: InsightCardProps) {
  const theme = useTheme()
  const itemColor = color || theme.colors.primary
  const isFlippable = explanationTitle && explanationText

  const frontContent = (
    <View style={[styles.card, { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow }]}>
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
              {items.map((item, itemIndex) => {
                const itemText = typeof item === 'string' ? item : JSON.stringify(item)
                return (
                  <View key={itemIndex} style={styles.itemRow}>
                    <View style={[styles.bullet, { backgroundColor: itemColor }]} />
                    <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>{itemText}</Text>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {isFlippable && (
          <View style={styles.flipHintContainer}>
            <Text style={[styles.flipHint, { color: theme.colors.textSecondary }]}>Tap to learn more 💡</Text>
          </View>
        )}
      </View>
    </View>
  )

  const backContent = isFlippable ? (
    <View
      style={[
        styles.card,
        styles.backCard,
        { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
      ]}
    >
      <View style={styles.backContent}>
        <View style={styles.backCenterSection}>
          {icon && <Text style={styles.backIcon}>{icon}</Text>}
          <Text style={[styles.backTitle, { color: theme.colors.text }]}>{explanationTitle}</Text>
          <Text style={[styles.backDescription, { color: theme.colors.textSecondary }]}>{explanationText}</Text>
        </View>

        <View style={styles.flipHintContainer}>
          <Text style={[styles.flipHint, { color: theme.colors.textSecondary }]}>Tap to flip back ↩️</Text>
        </View>
      </View>
    </View>
  ) : null

  // For flippable cards, use the animation hook directly to avoid nested Pressables
  if (isFlippable) {
    const entranceDelay = index !== undefined ? index * 80 : undefined
    const { scale, opacity, slideY, shake, rotate, handlePressIn, handlePressOut } = useCardAnimation({
      entranceAnimation: !disableEntranceAnimation,
      entranceDelay,
    })

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [{ translateY: slideY }, { translateX: shake }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale }, { rotate }],
          }}
        >
          <FlippableCard
            front={frontContent}
            back={backContent!}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </Animated.View>
      </Animated.View>
    )
  }

  return (
    <AnimatedCard
      index={index}
      containerStyle={styles.cardContainer}
      animationConfig={{
        entranceAnimation: !disableEntranceAnimation,
      }}
    >
      {frontContent}
    </AnimatedCard>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    minHeight: 380,
  },
  backCard: {
    minHeight: 380,
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
