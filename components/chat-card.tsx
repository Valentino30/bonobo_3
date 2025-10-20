import { ThemedIconButton } from '@/components/themed-icon-button'
import { ThemedText } from '@/components/themed-text'
import { AnimatedCard } from '@/components/animated-card'
import { BottomSheet } from '@/components/bottom-sheet'
import { useTheme } from '@/contexts/theme-context'
import { type StoredChat } from '@/utils/chat-storage'
import { getParticipantInitial } from '@/utils/string-helpers'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

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

  return (
    <>
      <AnimatedCard
        onPress={handleAnalyze}
        containerStyle={[styles.chatCard, { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow }]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.infoLight }]}>
          <ThemedText style={[styles.avatarText, { color: theme.colors.textWhite }]}>{getParticipantInitial(chat.participants)}</ThemedText>
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={[styles.participantName, { color: theme.colors.text }]} numberOfLines={1}>
            {chat.participants?.join(' & ') || 'Unknown participants'}
          </ThemedText>
          <ThemedText style={[styles.messageCount, { color: theme.colors.textTertiary }]}>
            {chat.messageCount || 0} messages
          </ThemedText>
        </View>
        {onDelete && (
          <ThemedIconButton
            icon="dots-horizontal"
            onPress={(e) => {
              e?.stopPropagation?.()
              setShowMenu(true)
            }}
            variant="ghost"
            size="medium"
            style={styles.menuButton}
          />
        )}
      </AnimatedCard>

      <BottomSheet
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        actions={[
          {
            title: 'Delete Chat',
            onPress: handleDelete,
            variant: 'destructive',
          },
          {
            title: 'Cancel',
            onPress: () => setShowMenu(false),
            variant: 'secondary',
          },
        ]}
      />
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
    padding: 0,
  },
})
