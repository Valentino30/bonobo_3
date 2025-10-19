import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, Text, View } from 'react-native'
import { ThemedButton } from '@/components/themed-button'

interface LockedInsightCardProps {
  title: string
  icon?: string
  badge?: {
    text: string
    color: string
  }
  onUnlock: () => void
  isLoading?: boolean
  unlockText?: string
}

export function LockedInsightCard({ title, icon, badge, onUnlock, isLoading, unlockText }: LockedInsightCardProps) {
  const theme = useTheme()

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow, borderColor: theme.colors.backgroundSecondary }]}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {/* Show Premium badge when locked */}
          <View style={[styles.premiumBadge, { backgroundColor: theme.colors.backgroundInfo, borderColor: theme.colors.primaryLighter }]}>
            <Text style={[styles.premiumBadgeText, { color: theme.colors.primary }]}>PREMIUM</Text>
          </View>
        </View>
      </View>

      {/* Locked Content - Matcha Gradient Style */}
      <View style={styles.lockedContent}>
        {/* Gradient Container */}
        <View style={[styles.gradientContainer, { backgroundColor: theme.colors.backgroundSuccessLight }]}>
          {/* Blurred Preview Effect */}
          <View style={styles.blurredPreview}>
            <View style={[styles.blurLine, { backgroundColor: theme.colors.primaryLighter }]} />
            <View style={[styles.blurLine, { backgroundColor: theme.colors.primaryLighter, width: '85%' }]} />
            <View style={[styles.blurLine, { backgroundColor: theme.colors.primaryLighter, width: '70%' }]} />
          </View>

          {/* Question Text */}
          {unlockText && <Text style={[styles.questionText, { color: theme.colors.primaryAccent }]}>{unlockText}</Text>}

          {/* Unlock Button with Icon */}
          <ThemedButton
            title={isLoading ? 'UNLOCKING...' : 'UNLOCK WITH AI'}
            onPress={onUnlock}
            variant="primary"
            size="medium"
            icon="auto-fix"
            iconPosition="right"
            loading={isLoading}
            disabled={isLoading}
            shadow
            fullWidth
            uppercase
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 280,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flex: 1,
  },
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  lockedContent: {
    overflow: 'hidden',
  },
  gradientContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurredPreview: {
    width: '100%',
    gap: 10,
    marginBottom: 28,
    opacity: 0.25,
  },
  blurLine: {
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
})
