import { ThemedText } from '@/components/themed-text'
import { type StoredChat } from '@/utils/chat-storage'
import { useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

interface ChatCardProps {
  chat: StoredChat
  onAnalyze: (chatId: string) => void
  onDelete?: (chatId: string) => void
}

export function ChatCard({ chat, onAnalyze, onDelete }: ChatCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleAnalyze = () => {
    onAnalyze(chat.id)
  }

  const handleDelete = () => {
    setShowMenu(false)
    if (onDelete) {
      onDelete(chat.id)
    }
  }

  // Get initial for avatar from first participant
  const getInitial = () => {
    if (!chat.participants || chat.participants.length === 0) {
      return '?'
    }

    const firstParticipant = chat.participants[0]
    if (!firstParticipant || firstParticipant.trim().length === 0) {
      return '?'
    }

    return firstParticipant.trim()[0].toUpperCase()
  }

  return (
    <>
      <TouchableOpacity style={styles.chatCard} onPress={handleAnalyze} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{getInitial()}</ThemedText>
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.participantName}>
            {chat.participants?.join(' & ') || 'Unknown participants'}
          </ThemedText>
          <ThemedText style={styles.messageCount}>{chat.messageCount || 0} messages</ThemedText>
        </View>
        {onDelete && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation()
              setShowMenu(true)
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThemedText style={styles.menuIcon}>⋯</ThemedText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.bottomDrawer}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <ThemedText style={styles.deleteButtonText}>Delete Person</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowMenu(false)}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7BA1D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  messageCount: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '400',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#999999',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  deleteButton: {
    backgroundColor: '#E57373',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
})
