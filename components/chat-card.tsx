import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { AnimatedCard } from '@/components/animated-card'
import { BottomSheet } from '@/components/bottom-sheet'
import { ThemedIconButton } from '@/components/themed-icon-button'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { useTranslation } from '@/hooks/use-translation'
import { type StoredChat } from '@/services/chat-storage'
import { getParticipantInitial } from '@/utils/string-helpers'

interface ChatCardProps {
  chat: StoredChat
  onAnalyze: (chatId: string) => void
  onDelete?: (chatId: string) => void
  index?: number
}

export function ChatCard({ chat, onAnalyze, onDelete, index }: ChatCardProps) {
  const theme = useTheme()
  const { t } = useTranslation()
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

  const messageCount = chat.messageCount || 0
  const messageCountText =
    messageCount === 1
      ? t('chats.messageCountSingular', { count: messageCount })
      : t('chats.messageCount', { count: messageCount })

  return (
    <>
      <AnimatedCard
        onPress={handleAnalyze}
        containerStyle={[
          styles.chatCard,
          { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
        ]}
        index={index}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.infoLight }]}>
          <ThemedText style={[styles.avatarText, { color: theme.colors.textWhite }]}>
            {getParticipantInitial(chat.participants)}
          </ThemedText>
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={[styles.participantName, { color: theme.colors.text }]} numberOfLines={1}>
            {chat.participants?.join(' & ') || t('chats.unknownParticipants')}
          </ThemedText>
          <ThemedText style={[styles.messageCount, { color: theme.colors.textTertiary }]}>
            {messageCountText}
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
            title: t('chats.deleteChat'),
            onPress: handleDelete,
            variant: 'destructive',
          },
          {
            title: t('common.cancel'),
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
