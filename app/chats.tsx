import { ChatList } from '@/components/chat-list'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useShareIntent } from '@/hooks/use-share-intent'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Chat {
  id: string
  text: string
  timestamp: Date
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
      // Process the shared WhatsApp chat
      const newChat: Chat = {
        id: Date.now().toString(),
        text: shareData.text,
        timestamp: new Date(),
      }
      setChats((prev) => [newChat, ...prev])

      // Show confirmation
      Alert.alert('Chat Imported', 'WhatsApp chat has been successfully imported!', [
        { text: 'OK', onPress: clearShareData },
      ])
    }
  }, [hasShareData, shareData, clearShareData])

  const handleManualImport = () => {
    if (manualInput.trim()) {
      const newChat: Chat = {
        id: Date.now().toString(),
        text: manualInput.trim(),
        timestamp: new Date(),
      }
      setChats((prev) => [newChat, ...prev])
      setManualInput('')
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
