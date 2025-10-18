import { ChatList } from '@/components/chat-list'
import { useCustomAlert } from '@/components/custom-alert'
import { LoadingScreen } from '@/components/loading-screen'
import { ThemedButton } from '@/components/themed-button'
import { ThemedIconButton } from '@/components/themed-icon-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { useShareIntent } from '@/hooks/use-share-intent'
import { type StoredChat } from '@/utils/chat-storage'
import { parseWhatsAppChat } from '@/utils/whatsapp-parser'
import { extractWhatsAppZip } from '@/utils/zip-extractor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatsScreen() {
  const theme = useTheme()
  const { shareData, hasShareData, clearShareData } = useShareIntent()
  const { device, reload } = useLocalSearchParams<{ device?: string; reload?: string }>()
  const { chats, addChat: persistAddChat, deleteChat, isLoading, refreshChats } = usePersistedChats()
  const [manualInput, setManualInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { showAlert, AlertComponent } = useCustomAlert()
  const hasReloadedRef = useRef(false)
  const processedShareDataRef = useRef<string | null>(null)

  // Determine which platform to show instructions for
  const showPlatform = device || Platform.OS

  // Reload chats when coming from login/logout - only once
  useEffect(() => {
    if (reload === 'true' && !hasReloadedRef.current) {
      console.log('Reloading chats after auth change...')
      hasReloadedRef.current = true
      refreshChats()

      // Clear the reload parameter from URL after reloading
      router.replace('/chats')
    }
  }, [reload, refreshChats, router])

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
      console.log('🟡 useEffect triggered - Share intent state:', {
        hasShareData,
        hasText: !!shareData?.text,
        hasFiles: !!shareData?.files?.length,
        isProcessing,
        processedHash: processedShareDataRef.current
      })

      // Prevent processing if already in progress or no share data
      if (isProcessing || !hasShareData) {
        console.log('Already processing or no share data, skipping...')
        return
      }

      if (shareData?.text) {
        // Check if we've already processed this exact text
        const shareDataHash = shareData.text.substring(0, 100) + shareData.text.length
        console.log('🔍 Hash check - Current:', processedShareDataRef.current, 'New:', shareDataHash)

        if (processedShareDataRef.current === shareDataHash) {
          console.log('⏭️  Already processed this share data, skipping...')
          return
        }

        // Mark as processing IMMEDIATELY to prevent race conditions
        console.log('✅ Setting processed hash:', shareDataHash)
        processedShareDataRef.current = shareDataHash
        setIsProcessing(true)

        console.log('🟢 Processing share data:', shareData.text.substring(0, 100) + '...')

        // Parse the WhatsApp chat to extract participants and message count
        const parsedData = parseWhatsAppChat(shareData.text)
        console.log('Parsed data:', parsedData)

        // Check if this chat already exists (by checking first 100 chars)
        const chatPreview = shareData.text.substring(0, 100)
        const existingChat = chats.find(c => c.text.substring(0, 100) === chatPreview)

        if (existingChat) {
          console.log('⚠️ Chat already exists in database, skipping add:', existingChat.id)
          setIsProcessing(false)
          clearShareData()
          return
        }

        // Process the shared WhatsApp chat
        const chatId = Date.now().toString()
        const newChat: StoredChat = {
          id: chatId,
          text: shareData.text,
          timestamp: new Date(),
          participants: parsedData.participants,
          messageCount: parsedData.messageCount,
        }
        console.log('🔵 About to add chat to database:', { chatId, participants: parsedData.participants })
        await persistAddChat(newChat)
        console.log('🟢 Chat added to database successfully:', chatId)

        // Show confirmation with more details
        const participantNames =
          parsedData.participants.length > 0 ? parsedData.participants.join(' & ') : 'Unknown participants'

        showAlert(
          'Chat Imported Successfully!',
          `Chat between ${participantNames} with ${parsedData.messageCount} messages has been imported.`,
          [
            {
              text: 'OK',
              onPress: () => {
                processedShareDataRef.current = null
                clearShareData()
                setIsProcessing(false)
              },
            },
          ]
        )
      } else if (hasShareData && shareData?.files && shareData.files.length > 0) {
        // Handle ZIP files from WhatsApp
        const zipFilePath = shareData.files![0]

        // Check if we've already processed this exact file
        if (processedShareDataRef.current === zipFilePath) {
          console.log('⏭️  Already processed this ZIP file, skipping...')
          return
        }

        // Mark as processing IMMEDIATELY to prevent race conditions
        processedShareDataRef.current = zipFilePath
        setIsProcessing(true)

        console.log('🟢 ZIP file detected:', zipFilePath)

        try {
          console.log('Attempting to extract ZIP file:', zipFilePath)

          const extractedContent = await extractWhatsAppZip(zipFilePath)

          if (extractedContent) {
            console.log('Successfully extracted content from ZIP')

            // Parse the extracted WhatsApp chat
            const parsedData = parseWhatsAppChat(extractedContent)
            console.log('Parsed ZIP data:', parsedData)

            // Check if this chat already exists (by checking first 100 chars)
            const chatPreview = extractedContent.substring(0, 100)
            const existingChat = chats.find(c => c.text.substring(0, 100) === chatPreview)

            if (existingChat) {
              console.log('⚠️ Chat already exists in database, skipping add:', existingChat.id)
              setIsProcessing(false)
              clearShareData()
              return
            }

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

            showAlert(
              'Chat Imported Successfully!',
              `Chat between ${participantNames} with ${parsedData.messageCount} messages has been successfully imported.`,
              [
                {
                  text: 'Great!',
                  onPress: () => {
                    processedShareDataRef.current = null
                    clearShareData()
                    setIsProcessing(false)
                  },
                },
              ]
            )
          } else {
            // Failed to extract content
            showAlert(
              'ZIP Extraction Failed',
              'Could not extract chat content from the ZIP file. Please try exporting the chat as "Without Media" or use manual import.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    processedShareDataRef.current = null
                    clearShareData()
                    setIsProcessing(false)
                  },
                },
                {
                  text: 'Try Manual Import',
                  onPress: () => {
                    processedShareDataRef.current = null
                    clearShareData()
                    setIsProcessing(false)
                  },
                },
              ]
            )
          }
        } catch (error) {
          console.error('Error processing ZIP file:', error)
          showAlert(
            'ZIP Processing Error',
            'An error occurred while processing the ZIP file. Please try again or use manual import.',
            [
              {
                text: 'OK',
                onPress: () => {
                  processedShareDataRef.current = null
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
        showAlert(
          'Import Error',
          'No text data was found in the shared content. Please try exporting the chat again or use manual import.',
          [
            {
              text: 'OK',
              onPress: () => {
                processedShareDataRef.current = null
                clearShareData()
                setIsProcessing(false)
              },
            },
          ]
        )
      }
    }

    processShareData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareData, shareData])

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

      showAlert(
        'Chat Imported Successfully!',
        `Chat between ${participantNames} with ${parsedData.messageCount} messages has been imported.`,
        [{ text: 'OK' }]
      )
    }
  }

  const handleAnalyzeChat = (chatId: string) => {
    // Use string interpolation for dynamic route
    router.push(`/analysis/${chatId}`)
  }

  // Show loading screen while chats are being loaded
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.loadingContainer}>
          <LoadingScreen icon="database-search" title="Loading Chats" subtitle="Fetching your conversations..." />
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ThemedView style={styles.container}>
        {/* Header with Profile Icon */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            Bonobo
          </ThemedText>
          <ThemedIconButton
            icon="account"
            onPress={() => router.push('/profile')}
            variant="primary"
            size="large"
            style={styles.profileButton}
          />
        </View>

        {/* Custom Alert */}
        <AlertComponent />

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

        <ThemedButton
          title="Import Chat"
          onPress={() => router.push('/import-guide')}
          variant="primary"
          size="large"
          icon="whatsapp"
          iconPosition="left"
          shadow
          style={styles.importButton}
        />
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
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    lineHeight: 40,
    flex: 1,
  },
  profileButton: {
    padding: 8,
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  importButtonText: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
})
