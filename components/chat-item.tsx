import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet } from 'react-native'

interface ChatItemProps {
  chat: {
    id: string
    text: string
    timestamp: Date
  }
}

export function ChatItem({ chat }: ChatItemProps) {
  const formatChatPreview = (text: string) => {
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }

  return (
    <ThemedView style={styles.chatItem}>
      <ThemedText style={styles.chatTimestamp}>{chat.timestamp.toLocaleString()}</ThemedText>
      <ThemedText style={styles.chatText}>{formatChatPreview(chat.text)}</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  chatItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B8E5A',
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
