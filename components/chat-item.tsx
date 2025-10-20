import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { truncateText } from '@/utils/string-helpers'
import { StyleSheet } from 'react-native'

interface ChatItemProps {
  chat: {
    id: string
    text: string
    timestamp: Date
  }
}

export function ChatItem({ chat }: ChatItemProps) {
  const theme = useTheme()

  return (
    <ThemedView style={[styles.chatItem, { backgroundColor: theme.colors.backgroundLoading, borderLeftColor: theme.colors.primary }]}>
      <ThemedText style={styles.chatTimestamp}>{chat.timestamp.toLocaleString()}</ThemedText>
      <ThemedText style={styles.chatText}>{truncateText(chat.text)}</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  chatItem: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  chatTimestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
})
