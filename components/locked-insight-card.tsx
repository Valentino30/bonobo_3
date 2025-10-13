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
}

export function LockedInsightCard({ title, icon, badge, onUnlock, isLoading }: LockedInsightCardProps) {
  return (
    <View style={styles.card}>
      {/* Header Section with Divider */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: `${badge.color}20` }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          )}
        </View>
        <View style={styles.divider} />
      </View>

      {/* Locked Content */}
      <View style={styles.lockedContent}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedText}>Unlock to view AI insights</Text>
        <TouchableOpacity
          style={[styles.unlockButton, isLoading && styles.unlockButtonDisabled]}
          onPress={onUnlock}
          disabled={isLoading}
        >
          <Text style={styles.unlockButtonText}>{isLoading ? 'Unlocking...' : 'Unlock Insight'}</Text>
        </TouchableOpacity>
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
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
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
    backgroundColor: '#E8E8E8',
    marginTop: 12,
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
  lockedContent: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.3,
  },
  lockedText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  unlockButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
