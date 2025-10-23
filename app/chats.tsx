import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChatList } from '@/components/chat-list'
import { LoadingScreen } from '@/components/loading-screen'
import { ThemedButton } from '@/components/themed-button'
import { ThemedIconButton } from '@/components/themed-icon-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { useChats } from '@/hooks/use-chats'
import { useShareImport } from '@/hooks/use-share-import'
import { useShareIntent } from '@/hooks/use-share-intent'
import { useTranslation } from '@/hooks/use-translation'

export default function ChatsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()

  // Share intent handling
  const { shareData, hasShareData, clearShareData } = useShareIntent()

  // Timeout for stale share intent - defensive workaround
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
  const { alert: shareImportAlert } = useShareImport({
    shareData,
    hasShareData,
    clearShareData,
  })

  // Data and business logic
  const { chats, isLoading, deleteChat } = useChats()

  // Show loading screen while chats are being loaded
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.loadingContainer}>
          <LoadingScreen icon="database-search" title={t('chats.loading')} subtitle={t('chats.fetching')} />
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

        {/* Share Import Alert */}
        {shareImportAlert}

        <ChatList
          chats={chats}
          onAnalyzeChat={(chatId) => router.push(`/analysis/${chatId}`)}
          onDeleteChat={deleteChat}
        />

        <ThemedButton
          title={t('chats.importButton')}
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
  importButton: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
})
