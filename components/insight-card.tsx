import { ThemedText } from '@/components/themed-text'
import { StyleSheet, View } from 'react-native'

interface InsightCardProps {
  title: string
  icon?: string
  value: string | number
  description?: string
  items?: string[]
  badge?: {
    text: string
    color: string
  }
  color?: string
}

export function InsightCard({ title, icon, value, description, items, badge, color = '#6B8E5A' }: InsightCardProps) {
  return (
    <View style={styles.card}>
      {/* Header Section with Divider */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
          <ThemedText style={styles.title}>{title}</ThemedText>
          {badge && (
            <View style={[styles.badge, { backgroundColor: `${badge.color}20` }]}>
              <ThemedText style={[styles.badgeText, { color: badge.color }]}>{badge.text}</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.divider} />
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <ThemedText style={[styles.value, { color }]}>{value}</ThemedText>
        {description && <ThemedText style={styles.description}>{description}</ThemedText>}
        
        {items && items.length > 0 && (
          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={[styles.bullet, { backgroundColor: color }]} />
                <ThemedText style={styles.itemText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}const styles = StyleSheet.create({
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
    backgroundColor: '#FAFAFA',
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
  content: {
    padding: 16,
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
    color: '#666666',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  itemsList: {
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
    color: '#666666',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
})
