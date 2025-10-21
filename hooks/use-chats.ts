import { useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { useShareImport } from '@/hooks/use-share-import'
import { useShareIntent } from '@/hooks/use-share-intent'
import { type StoredChat } from '@/utils/chat-storage'
import { createShareImportAlerts } from '@/utils/share-import-alerts'
import { parseWhatsAppChat } from '@/utils/whatsapp-parser'

type UseChatsOptions = {
  showAlert: (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => void
}

/**
 * Comprehensive hook that manages all business logic for chats
 * Handles share intents, manual imports, navigation, and data management
 */
export function useChats({ showAlert }: UseChatsOptions) {
  const router = useRouter()
  const { shareData, hasShareData, clearShareData } = useShareIntent()
  const { device, reload } = useLocalSearchParams<{ device?: string; reload?: string }>()
  const { chats, addChat: persistAddChat, deleteChat, isLoading, refreshChats } = usePersistedChats()
  const [manualInput, setManualInput] = useState('')
  const hasReloadedRef = useRef(false)

  // Create alert configurations for manual text imports (without clearShareData callback)
  const manualAlerts = useMemo(() => createShareImportAlerts(), [])

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

  // Handle manual chat import
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

      const config = manualAlerts.success(participantNames, parsedData.messageCount)
      showAlert(config.title, config.message, config.buttons)
    }
  }

  // Navigate to chat analysis screen
  const handleAnalyzeChat = (chatId: string) => {
    router.push(`/analysis/${chatId}`)
  }

  // Navigate to profile screen
  const handleNavigateToProfile = () => {
    router.push('/profile')
  }

  // Navigate to import guide
  const handleNavigateToImportGuide = () => {
    router.push('/import-guide')
  }

  return {
    // Data
    chats,
    isLoading,
    hasShareData,
    showPlatform,
    manualInput,

    // Setters
    setManualInput,

    // Handlers
    handleManualImport,
    handleAnalyzeChat,
    handleNavigateToProfile,
    handleNavigateToImportGuide,
    deleteChat,
    clearShareData,
  }
}
