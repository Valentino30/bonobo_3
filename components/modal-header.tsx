import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, Text, View } from 'react-native'

interface ModalHeaderProps {
  emoji: string
  title: string
  subtitle: string
}

/**
 * Reusable modal header with emoji, title, and subtitle
 * Used for consistent header styling across modals
 *
 * @example
 * <ModalHeader
 *   emoji="🔐"
 *   title="Secure Your Purchase"
 *   subtitle="Create an account to access your insights from any device"
 * />
 */
export function ModalHeader({ emoji, title, subtitle }: ModalHeaderProps) {
  const theme = useTheme()

  return (
    <View style={styles.header}>
      <Text style={styles.emoji}>{emoji}</Text>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
})
