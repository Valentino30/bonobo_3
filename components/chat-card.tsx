import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, TouchableOpacity } from 'react-native'

interface ChatCardProps {
  chat: {
    id: string
    text: string
    timestamp: Date
    participants?: string[]
    messageCount?: number
  }
  onAnalyze: (chatId: string) => void
}

export function ChatCard({ chat, onAnalyze }: ChatCardProps) {
  const handleAnalyze = () => {
    onAnalyze(chat.id)
  }

  return (
    <ThemedView style={styles.chatCard}>
      <ThemedView style={styles.cardHeader}>
        <ThemedView style={styles.participantsContainer}>
          <ThemedText style={styles.participantsLabel}>Participants:</ThemedText>
          <ThemedText style={styles.participantsText}>
            {chat.participants?.join(' & ') || 'Unknown participants'}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.timestamp}>{chat.timestamp.toLocaleDateString()}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.cardStats}>
        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statNumber}>{chat.messageCount || 0}</ThemedText>
          <ThemedText style={styles.statLabel}>Messages</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statDivider} />
        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statNumber}>💬</ThemedText>
          <ThemedText style={styles.statLabel}>WhatsApp</ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
        <ThemedText style={styles.analyzeButtonText}>🔍 Analyze Chat</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  participantsContainer: {
    flex: 1,
    marginRight: 8,
  },
  participantsLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  participantsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B8E5A',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B8E5A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  analyzeButton: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
})
