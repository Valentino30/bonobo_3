import { ChatCard } from '@/components/chat-card'
import { EmptyState } from '@/components/empty-state'
import { type StoredChat } from '@/utils/chat-storage'
import { ScrollView, StyleSheet } from 'react-native'

interface ChatListProps {
  chats: StoredChat[]
  hasShareData: boolean
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
  onAnalyzeChat: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
  onClearShareData?: () => void
}

export function ChatList({
  chats,
  hasShareData,
  showPlatform,
  manualInput,
  setManualInput,
  onManualImport,
  onAnalyzeChat,
  onDeleteChat,
  onClearShareData,
}: ChatListProps) {
  return (
    <ScrollView
      style={styles.chatList}
      contentContainerStyle={styles.chatListContent}
      showsVerticalScrollIndicator={false}
    >
      {chats.length > 0 ? (
        chats.map((chat, index) => (
          <ChatCard key={chat.id} chat={chat} onAnalyze={onAnalyzeChat} onDelete={onDeleteChat} index={index} />
        ))
      ) : (
        <EmptyState
          hasShareData={hasShareData}
          showPlatform={showPlatform}
          manualInput={manualInput}
          setManualInput={setManualInput}
          onManualImport={onManualImport}
          onClearShareData={onClearShareData}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  chatList: {
    width: '100%',
  },
  chatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
})
