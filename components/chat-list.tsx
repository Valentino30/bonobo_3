import { ChatCard } from '@/components/chat-card'
import { EmptyState } from '@/components/empty-state'
import { ScrollView, StyleSheet } from 'react-native'

interface Chat {
  id: string
  text: string
  timestamp: Date
  participants?: string[]
  messageCount?: number
}

interface ChatListProps {
  chats: Chat[]
  hasShareData: boolean
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
  onAnalyzeChat: (chatId: string) => void
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
  onClearShareData,
}: ChatListProps) {
  return (
    <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
      {chats.length > 0 ? (
        chats.map((chat) => <ChatCard key={chat.id} chat={chat} onAnalyze={onAnalyzeChat} />)
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
    flex: 1,
    width: '100%',
  },
})
