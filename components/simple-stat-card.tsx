import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, View } from 'react-native'

interface SimpleStatCardProps {
  title: string
  icon: string
  value: string | number
}

export function SimpleStatCard({ title, icon, value }: SimpleStatCardProps) {
  return (
    <ThemedView style={styles.statCard}>
      <View style={styles.titleRow}>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        <ThemedText style={styles.iconText}>{icon}</ThemedText>
      </View>
      <View style={styles.divider} />
      <ThemedText style={styles.singleValueNumber}>{value}</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  iconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  singleValueNumber: {
    fontSize: 40,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 48,
  },
})
