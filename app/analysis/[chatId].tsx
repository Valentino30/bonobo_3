import { ScrollView, StyleSheet, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { AnalysisInsights } from '@/components/analysis-insights'
import { AnalysisLoading } from '@/components/analysis-loading'
import { AnalysisOverview } from '@/components/analysis-overview'
import { PaymentAuthScreen } from '@/components/payment-auth-screen'
import { Paywall } from '@/components/paywall'
import { ScreenHeader } from '@/components/screen-header'
import { TabNavigation } from '@/components/tab-navigation'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { useChatAnalysis } from '@/hooks/use-chat-analysis'
import { useCustomAlert } from '@/hooks/use-custom-alert'

export default function ChatAnalysisScreen() {
  const theme = useTheme()
  const { showAlert, AlertComponent } = useCustomAlert()

  // All business logic encapsulated in custom hook
  const {
    chat,
    chatId,
    chatsLoading,
    analysis,
    aiInsights,
    showLoadingAnimation,
    error,
    activeTab,
    showPaywall,
    showAuthScreen,
    loadingInsight,
    isInsightUnlocked,
    getFrequencyLabel,
    handleTabChange,
    handleUnlockInsight,
    handlePurchase,
    handleAuthSuccess,
    handleLoadingComplete,
    handleGoBack,
    handleNavigateToChats,
    setShowPaywall,
    setShowAuthScreen,
  } = useChatAnalysis({ showAlert })

  // Show loading animation
  if (chatsLoading || !analysis || showLoadingAnimation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AnalysisLoading key={chatId} onComplete={handleLoadingComplete} />
      </SafeAreaView>
    )
  }

  // Show chat not found error
  if (!chat && !chatsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Chat Not Found</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>
            The requested chat could not be found.
          </ThemedText>
          <ThemedButton title="Back to Chats" onPress={handleNavigateToChats} variant="primary" size="large" />
        </ThemedView>
      </SafeAreaView>
    )
  }

  // Show analysis error
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Analysis Error</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>{error}</ThemedText>
          <ThemedButton title="Go Back" onPress={handleGoBack} variant="primary" size="large" />
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Fixed Header */}
      <ScreenHeader title="Chat Analysis" style={[styles.header, { backgroundColor: theme.colors.background }]}>
        {/* Tab Navigation */}
        <TabNavigation
          tabs={[
            { id: 'overview', label: 'Overview', icon: 'chart-box-outline' },
            { id: 'insights', label: 'Insights', icon: 'auto-fix' },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </ScreenHeader>

      {/* Custom Alert */}
      <AlertComponent />

      {/* Paywall Modal */}
      <Paywall visible={showPaywall} onClose={() => setShowPaywall(false)} onPurchase={handlePurchase} />

      {/* Auth Screen Modal */}
      <PaymentAuthScreen
        visible={showAuthScreen}
        onClose={() => setShowAuthScreen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <AnalysisOverview analysis={analysis} />
          ) : (
            <AnalysisInsights
              aiInsights={aiInsights}
              isInsightUnlocked={isInsightUnlocked}
              loadingInsight={loadingInsight}
              onUnlockInsight={handleUnlockInsight}
              getFrequencyLabel={getFrequencyLabel}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
    letterSpacing: 0.1,
  },
})
