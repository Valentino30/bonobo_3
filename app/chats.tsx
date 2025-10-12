import { ChatList } from '@/components/chat-list'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { useShareIntent } from '@/hooks/use-share-intent'
import { type StoredChat } from '@/utils/chat-storage'
import { parseWhatsAppChat } from '@/utils/whatsapp-parser'
import { extractWhatsAppZip } from '@/utils/zip-extractor'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatsScreen() {
  const { shareData, hasShareData, clearShareData } = useShareIntent()
  const { device } = useLocalSearchParams<{ device?: string }>()
  const { chats, addChat: persistAddChat, deleteChat } = usePersistedChats()
  const [manualInput, setManualInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Determine which platform to show instructions for
  const showPlatform = device || Platform.OS

  // Add timeout for share intent processing
  useEffect(() => {
    if (hasShareData && !shareData?.text) {
      // If we have share intent but no text after 3 seconds, clear it
      const timeout = setTimeout(() => {
        console.log('Share intent timeout - clearing stale state')
        clearShareData()
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [hasShareData, shareData, clearShareData])

  useEffect(() => {
    const processShareData = async () => {
      console.log('Share intent state:', { hasShareData, shareData, isProcessing })

      // Prevent processing if already in progress
      if (isProcessing) {
        console.log('Already processing, skipping...')
        return
      }

      if (hasShareData && shareData?.text) {
        console.log('Processing share data:', shareData.text.substring(0, 100) + '...')

        setIsProcessing(true)

        // Parse the WhatsApp chat to extract participants and message count
        const parsedData = parseWhatsAppChat(shareData.text)
        console.log('Parsed data:', parsedData)

        // Process the shared WhatsApp chat
        const newChat: StoredChat = {
          id: Date.now().toString(),
          text: shareData.text,
          timestamp: new Date(),
          participants: parsedData.participants,
          messageCount: parsedData.messageCount,
        }
        await persistAddChat(newChat)

        // Show confirmation with more details
        const participantNames =
          parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

        Alert.alert(
          'Chat Imported Successfully!',
          `Chat between ${participantNames} with ${parsedData.messageCount} messages has been imported.`,
          [{ text: 'OK', onPress: clearShareData }]
        )
      } else if (hasShareData && shareData?.files && shareData.files.length > 0) {
        // Handle ZIP files from WhatsApp
        console.log('ZIP file detected:', shareData.files![0])

        setIsProcessing(true)

        try {
          const zipFilePath = shareData.files![0]
          console.log('Attempting to extract ZIP file:', zipFilePath)

          const extractedContent = await extractWhatsAppZip(zipFilePath)

          if (extractedContent) {
            console.log('Successfully extracted content from ZIP')

            // Parse the extracted WhatsApp chat
            const parsedData = parseWhatsAppChat(extractedContent)
            console.log('Parsed ZIP data:', parsedData)

            // Process the extracted WhatsApp chat
            const newChat: StoredChat = {
              id: Date.now().toString(),
              text: extractedContent,
              timestamp: new Date(),
              participants: parsedData.participants,
              messageCount: parsedData.messageCount,
            }
            await persistAddChat(newChat)

            // Show confirmation
            const participantNames =
              parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

            Alert.alert(
              'Chat Imported Successfully!',
              `Chat between ${participantNames} with ${parsedData.messageCount} messages has been imported from ZIP file.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    clearShareData()
                    setIsProcessing(false)
                  },
                },
              ]
            )
          } else {
            // Failed to extract content
            Alert.alert(
              'ZIP Extraction Failed',
              'Could not extract chat content from the ZIP file. Please try exporting the chat as "Without Media" or use manual import.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    clearShareData()
                    setIsProcessing(false)
                  },
                },
                {
                  text: 'Try Manual Import',
                  onPress: () => {
                    clearShareData()
                    setIsProcessing(false)
                  },
                },
              ]
            )
          }
        } catch (error) {
          console.error('Error processing ZIP file:', error)
          Alert.alert(
            'ZIP Processing Error',
            'An error occurred while processing the ZIP file. Please try again or use manual import.',
            [
              {
                text: 'OK',
                onPress: () => {
                  clearShareData()
                  setIsProcessing(false)
                },
              },
            ]
          )
        }
      } else if (hasShareData && (!shareData || !shareData.text)) {
        // Handle case where share intent is detected but no text data
        console.log('Share intent detected but no text data:', shareData)
        Alert.alert(
          'Import Error',
          'No text data was found in the shared content. Please try exporting the chat again or use manual import.',
          [{ text: 'OK', onPress: clearShareData }]
        )
      }
    }

    processShareData()
  }, [hasShareData, shareData, isProcessing, clearShareData, persistAddChat, setIsProcessing])

  const handleManualImport = async () => {
    if (manualInput.trim()) {
      // Parse the manually entered WhatsApp chat
      const parsedData = parseWhatsAppChat(manualInput.trim())

      const newChat: StoredChat = {
        id: Date.now().toString(),
        text: manualInput.trim(),
        timestamp: new Date(),
        participants: parsedData.participants,
        messageCount: parsedData.messageCount,
      }
      await persistAddChat(newChat)
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
          onDeleteChat={deleteChat}
          onClearShareData={clearShareData}
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
