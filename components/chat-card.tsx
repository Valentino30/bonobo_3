import { ThemedText } from '@/components/themed-text'
import { ThemedButton } from '@/components/themed-button'
import { useTheme } from '@/contexts/theme-context'
import { type StoredChat } from '@/utils/chat-storage'
import { useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

interface ChatCardProps {
  chat: StoredChat
  onAnalyze: (chatId: string) => void
  onDelete?: (chatId: string) => void
}

export function ChatCard({ chat, onAnalyze, onDelete }: ChatCardProps) {
  const theme = useTheme()
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
      <TouchableOpacity style={[styles.chatCard, { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow }]} onPress={handleAnalyze} activeOpacity={0.7}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.infoLight }]}>
          <ThemedText style={[styles.avatarText, { color: theme.colors.textWhite }]}>{getInitial()}</ThemedText>
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={[styles.participantName, { color: theme.colors.text }]} numberOfLines={1}>
            {chat.participants?.join(' & ') || 'Unknown participants'}
          </ThemedText>
          <ThemedText style={[styles.messageCount, { color: theme.colors.textTertiary }]}>{chat.messageCount || 0} messages</ThemedText>
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
            <ThemedText style={[styles.menuIcon, { color: theme.colors.textTertiary }]}>⋯</ThemedText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: theme.colors.backgroundOverlay }]} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.bottomDrawer, { backgroundColor: theme.colors.backgroundLight }]}>
            <ThemedButton
              title="Delete Chat"
              onPress={handleDelete}
              variant="destructive"
              size="large"
              fullWidth
              style={styles.drawerButton}
            />
            <ThemedButton
              title="Cancel"
              onPress={() => setShowMenu(false)}
              variant="secondary"
              size="large"
              fullWidth
              style={styles.drawerButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  chatCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  messageCount: {
    fontSize: 14,
    fontWeight: '400',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomDrawer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  drawerButton: {
    marginBottom: 12,
  },
})
