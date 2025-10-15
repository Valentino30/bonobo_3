import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

interface SimpleStatCardProps {
  title: string
  icon: string
  value: string | number
}

export function SimpleStatCard({ title, icon, value }: SimpleStatCardProps) {
  const theme = useTheme()

  return (
    <ThemedView style={[styles.statCard, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.borderLight, shadowColor: theme.colors.shadow }]}>
      <View style={styles.titleRow}>
        <ThemedText style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{title}</ThemedText>
        <ThemedText style={styles.iconText}>{icon}</ThemedText>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.colors.backgroundSecondary }]} />
      <ThemedText style={[styles.singleValueNumber, { color: theme.colors.text }]}>{value}</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
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
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  iconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  singleValueNumber: {
    fontSize: 40,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 48,
  },
})
