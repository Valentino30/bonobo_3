import { AnimatedIcon } from '@/components/animated-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'

interface LoadingScreenProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  title: string
  subtitle: string
}

export function LoadingScreen({ icon = 'database-search', title, subtitle }: LoadingScreenProps) {
  const theme = useTheme()

  return (
    <ThemedView style={styles.loadingContainer}>
      <ThemedView style={[styles.loadingCard, { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow, borderColor: theme.colors.backgroundSecondary }]}>
        <AnimatedIcon
          icon={icon}
          iconSize={48}
          containerSize={80}
          animation="pulsate"
        />
        <ThemedText style={[styles.loadingTitle, { color: theme.colors.text }]}>{title}</ThemedText>
        <ThemedText style={[styles.loadingSubtitle, { color: theme.colors.textTertiary }]}>{subtitle}</ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    gap: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 24,
  },
})
