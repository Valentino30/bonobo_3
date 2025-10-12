import { ChatItem } from '@/components/chat-item'
import { EmptyState } from '@/components/empty-state'
import { ScrollView, StyleSheet } from 'react-native'

interface Chat {
  id: string
  text: string
  timestamp: Date
}

interface ChatListProps {
  chats: Chat[]
  hasShareData: boolean
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
}

export function ChatList({
  chats,
  hasShareData,
  showPlatform,
  manualInput,
  setManualInput,
  onManualImport,
}: ChatListProps) {
  return (
    <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
      {chats.length > 0 ? (
        chats.map((chat) => <ChatItem key={chat.id} chat={chat} />)
      ) : (
        <EmptyState
          hasShareData={hasShareData}
          showPlatform={showPlatform}
          manualInput={manualInput}
          setManualInput={setManualInput}
          onManualImport={onManualImport}
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
