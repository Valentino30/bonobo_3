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
  const { showAlert, AlertComponent } = useCustomAlert()

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
        <AlertComponent />

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
