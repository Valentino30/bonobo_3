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
import { useShareImport } from '@/hooks/use-share-import'
import { type StoredChat } from '@/utils/chat-storage'
import { createShareImportAlerts } from '@/utils/share-import-alerts'
import { parseWhatsAppChat } from '@/utils/whatsapp-parser'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatsScreen() {
  const theme = useTheme()
  const { shareData, hasShareData, clearShareData } = useShareIntent()
  const { device, reload } = useLocalSearchParams<{ device?: string; reload?: string }>()
  const { chats, addChat: persistAddChat, deleteChat, isLoading, refreshChats } = usePersistedChats()
  const [manualInput, setManualInput] = useState('')
  const router = useRouter()
  const { showAlert, AlertComponent } = useCustomAlert()
  const hasReloadedRef = useRef(false)

  // Create alert configurations (memoized to avoid recreating on each render)
  const alerts = useMemo(() => createShareImportAlerts(clearShareData), [clearShareData])

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

  // Process shared WhatsApp data with integrated alert handling
  useShareImport({
    shareData,
    hasShareData,
    clearShareData,
    addChat: persistAddChat,
    showAlert,
  })

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

      const config = alerts.manualImportSuccess(participantNames, parsedData.messageCount)
      showAlert(config.title, config.message, config.buttons)
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
