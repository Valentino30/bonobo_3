import { ChatList } from '@/components/chat-list'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useShareIntent } from '@/hooks/use-share-intent'
import { parseWhatsAppChat } from '@/utils/whatsapp-parser'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Chat {
  id: string
  text: string
  timestamp: Date
  participants?: string[]
  messageCount?: number
}

export default function ChatsScreen() {
  const { shareData, hasShareData, clearShareData } = useShareIntent()
  const { device } = useLocalSearchParams<{ device?: string }>()
  const [chats, setChats] = useState<Chat[]>([])
  const [manualInput, setManualInput] = useState('')

  // Determine which platform to show instructions for
  const showPlatform = device || Platform.OS

  useEffect(() => {
    if (hasShareData && shareData?.text) {
      // Parse the WhatsApp chat to extract participants and message count
      const parsedData = parseWhatsAppChat(shareData.text)

      // Process the shared WhatsApp chat
      const newChat: Chat = {
        id: Date.now().toString(),
        text: shareData.text,
        timestamp: new Date(),
        participants: parsedData.participants,
        messageCount: parsedData.messageCount,
      }
      setChats((prev) => [newChat, ...prev])

      // Show confirmation with more details
      const participantNames =
        parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

      Alert.alert(
        'Chat Imported Successfully!',
        `Chat between ${participantNames} with ${parsedData.messageCount} messages has been imported.`,
        [{ text: 'OK', onPress: clearShareData }]
      )
    }
  }, [hasShareData, shareData, clearShareData])

  const handleManualImport = () => {
    if (manualInput.trim()) {
      // Parse the manually entered WhatsApp chat
      const parsedData = parseWhatsAppChat(manualInput.trim())

      const newChat: Chat = {
        id: Date.now().toString(),
        text: manualInput.trim(),
        timestamp: new Date(),
        participants: parsedData.participants,
        messageCount: parsedData.messageCount,
      }
      setChats((prev) => [newChat, ...prev])
      setManualInput('')

      // Show confirmation with details
      const participantNames =
        parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

      Alert.alert(
        'Chat Imported Successfully!',
        `Chat between ${participantNames} with ${parsedData.messageCount} messages has been imported.`,
        [{ text: 'OK' }]
      )
    }
  }

  const handleAnalyzeChat = (chatId: string) => {
    // TODO: Navigate to analysis screen or show analysis modal
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      Alert.alert(
        'Analyze Chat',
        `This will analyze the chat between ${chat.participants?.join(' & ') || 'participants'} with ${
          chat.messageCount
        } messages.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Analyze', onPress: () => console.log('Analyzing chat:', chatId) },
        ]
      )
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Chats</ThemedText>

        <ChatList
          chats={chats}
          hasShareData={hasShareData}
          showPlatform={showPlatform}
          manualInput={manualInput}
          setManualInput={setManualInput}
          onManualImport={handleManualImport}
          onAnalyzeChat={handleAnalyzeChat}
        />

        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Back to Home</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6B8E5A',
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#F7F9F5',
    fontWeight: '600',
  },
})
