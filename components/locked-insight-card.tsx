import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
          {/* Show Premium badge when locked */}
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
        </View>
      </View>

      {/* Locked Content - Matcha Gradient Style */}
      <View style={styles.lockedContent}>
        {/* Gradient Container */}
        <View style={styles.gradientContainer}>
          {/* Blurred Preview Effect */}
          <View style={styles.blurredPreview}>
            <View style={styles.blurLine} />
            <View style={[styles.blurLine, { width: '85%' }]} />
            <View style={[styles.blurLine, { width: '70%' }]} />
          </View>

          {/* Question Text */}
          {unlockText && <Text style={styles.questionText}>{unlockText}</Text>}

          {/* Unlock Button with Icon */}
          <TouchableOpacity
            style={[styles.unlockButton, isLoading && styles.unlockButtonDisabled]}
            onPress={onUnlock}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.unlockButtonText}>{isLoading ? 'UNLOCKING...' : 'UNLOCK WITH AI'}</Text>
            <MaterialCommunityIcons name="auto-fix" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    color: '#1A1A1A',
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
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    backgroundColor: '#F5F9F3',
    borderWidth: 1,
    borderColor: '#D5E3CE',
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6B8E5A',
  },
  lockedContent: {
    overflow: 'hidden',
  },
  gradientContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FBF6',
  },
  blurredPreview: {
    width: '100%',
    gap: 10,
    marginBottom: 28,
    opacity: 0.25,
  },
  blurLine: {
    height: 10,
    backgroundColor: '#D5E3CE',
    borderRadius: 5,
    width: '100%',
  },
  questionText: {
    fontSize: 16,
    color: '#4A5D42',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  lockIcon: {
    fontSize: 14,
    opacity: 0.5,
  },
  lockBadgeText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  unlockButton: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  unlockButtonDisabled: {
    backgroundColor: '#A5B89D',
    shadowOpacity: 0.08,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
