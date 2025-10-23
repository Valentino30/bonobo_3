import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
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
import { useCustomAlert } from '@/hooks/ui/use-custom-alert'
import { useChatAnalysis } from '@/hooks/use-chat-analysis'
import { useInsightUnlock } from '@/hooks/use-insight-unlock'
import { usePaymentFlow } from '@/hooks/use-payment-flow'
import { useTranslation } from '@/hooks/use-translation'
import i18n from '@/i18n/config'
import { getFrequencyLabel } from '@/utils/insight-helpers'

type TabType = 'overview' | 'insights'

export default function ChatAnalysisScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { showAlert, alert } = useCustomAlert()

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)

  // Data fetching
  const { chat, chatId, chatsLoading, analysis, aiInsights, error } = useChatAnalysis()

  // Payment flow
  const { showPaywall, setShowPaywall, showAuthScreen, setShowAuthScreen, handlePurchase } = usePaymentFlow({
    chatId,
    showAlert,
    onPurchaseSuccess: () => {
      setActiveTab('insights')
      // Retry unlocking the pending insight after successful purchase
      if (pendingInsightToUnlock) {
        setTimeout(() => handleUnlockInsight(pendingInsightToUnlock), 500)
        setPendingInsightToUnlock(null)
      }
    },
  })

  // Insight unlocking
  const { handleUnlockInsight, isInsightUnlocked, loadingInsight, pendingInsightToUnlock, setPendingInsightToUnlock } =
    useInsightUnlock({
      chatId,
      chat: chat || null,
      analysis: analysis || null,
      showAlert,
      onNoAccess: () => setShowPaywall(true),
    })

  // Handlers
  const handleLoadingComplete = () => {
    setShowLoadingAnimation(false)
  }

  const handleAuthSuccess = () => {
    setShowAuthScreen(false)
    setActiveTab('insights')
    showAlert(i18n.t('analysisErrors.accountCreatedSuccess'), i18n.t('analysisErrors.accountCreatedSuccessMessage'))
  }

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
          <ThemedText type="title">{t('analysisScreen.chatNotFoundTitle')}</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>
            {t('analysisScreen.chatNotFoundMessage')}
          </ThemedText>
          <ThemedButton
            title={t('analysisScreen.backToChats')}
            onPress={() => router.push('/chats' as any)}
            variant="primary"
            size="large"
          />
        </ThemedView>
      </SafeAreaView>
    )
  }

  // Show analysis error
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">{t('analysisScreen.analysisErrorTitle')}</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>{error}</ThemedText>
          <ThemedButton
            title={t('analysisScreen.goBack')}
            onPress={() => router.back()}
            variant="primary"
            size="large"
          />
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Fixed Header */}
      <ScreenHeader
        title={t('analysisScreen.screenTitle')}
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        {/* Tab Navigation */}
        <TabNavigation
          tabs={[
            { id: 'overview', label: t('analysis.tabs.overview'), icon: 'chart-box-outline' },
            { id: 'insights', label: t('analysis.tabs.insights'), icon: 'auto-fix' },
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />
      </ScreenHeader>

      {/* Custom Alert */}
      {alert}

      {/* Paywall Modal */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={async (planId) => {
          await handlePurchase(planId)
        }}
      />

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
