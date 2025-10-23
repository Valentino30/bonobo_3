import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChatList } from '@/components/chat-list'
import { LoadingScreen } from '@/components/loading-screen'
import { ThemedButton } from '@/components/themed-button'
import { ThemedIconButton } from '@/components/themed-icon-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { useCustomAlert } from '@/hooks/ui/use-custom-alert'
import { useChats } from '@/hooks/use-chats'
import { useTranslation } from '@/hooks/use-translation'

export default function ChatsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { showAlert, alert } = useCustomAlert()

  // All business logic encapsulated in custom hook
  const { chats, isLoading, handleAnalyzeChat, handleNavigateToProfile, handleNavigateToImportGuide, deleteChat } =
    useChats({ showAlert })

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
            onPress={handleNavigateToProfile}
            variant="primary"
            size="large"
            style={styles.profileButton}
          />
        </View>

        {/* Custom Alert */}
        {alert}

        <ChatList chats={chats} onAnalyzeChat={handleAnalyzeChat} onDeleteChat={deleteChat} />

        <ThemedButton
          title={t('chats.importButton')}
          onPress={handleNavigateToImportGuide}
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
