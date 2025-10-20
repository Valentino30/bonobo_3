import { ChatCard } from '@/components/chat-card'
import { WelcomeState } from '@/components/welcome-state'
import { type StoredChat } from '@/utils/chat-storage'
import { ScrollView, StyleSheet } from 'react-native'

interface ChatListProps {
  chats: StoredChat[]
  onAnalyzeChat: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
}

export function ChatList({ chats, onAnalyzeChat, onDeleteChat }: ChatListProps) {
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
        <WelcomeState />
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
