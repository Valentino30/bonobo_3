import { AnalysisLoading } from '@/components/analysis-loading'
import { BackButton } from '@/components/back-button'
import { ComparisonCard } from '@/components/comparison-card'
import { useCustomAlert } from '@/components/custom-alert'
import { InsightCard } from '@/components/insight-card'
import { LockedInsightCard } from '@/components/locked-insight-card'
import { PaymentAuthScreen } from '@/components/payment-auth-screen'
import { Paywall } from '@/components/paywall'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { ThemedButton } from '@/components/themed-button'
import { ThemedTabButton } from '@/components/themed-tab-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { AuthService } from '@/utils/auth-service'
import { PaymentService } from '@/utils/payment-service'
import { StripeService } from '@/utils/stripe-service'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { analyzeChat, type AIInsights } from '../../utils/ai-service'
import { analyzeChatData } from '../../utils/chat-analyzer'

type TabType = 'overview' | 'insights'

interface ChatAnalysisData {
  totalMessages: number
  participant1: {
    name: string
    messageCount: number
    averageResponseTime: number
    interestLevel: number
    initiationRate?: number
    averageMessageLength?: number
  }
  participant2: {
    name: string
    messageCount: number
    averageResponseTime: number
    interestLevel: number
    initiationRate?: number
    averageMessageLength?: number
  }
  dateRange: { start: Date; end: Date }
  conversationHealth: {
    balanceScore: number
    engagementScore: number
  }
}

export default function ChatAnalysisScreen() {
  const theme = useTheme()
  const analysisRef = useRef<ChatAnalysisData | null>(null)
  const { chatId } = useLocalSearchParams<{ chatId: string }>()
  const { chats, isLoading: chatsLoading, updateChatAnalysis } = usePersistedChats()
  const router = useRouter()
  const previousChatIdRef = useRef<string | null>(null)
  const { showAlert, AlertComponent } = useCustomAlert()

  const chat = chats.find((c) => c.id === chatId)

  // Initialize states - delay initialization until we know chats are loaded
  const [analysis, setAnalysis] = useState<ChatAnalysisData | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuthScreen, setShowAuthScreen] = useState(false)
  const [unlockedInsights, setUnlockedInsights] = useState<Set<string>>(new Set())
  const [loadingInsight, setLoadingInsight] = useState<string | null>(null)
  const [pendingInsightToUnlock, setPendingInsightToUnlock] = useState<string | null>(null)

  // Debug: Log when showAuthScreen changes
  useEffect(() => {
    console.log('🔵 showAuthScreen state changed:', showAuthScreen)
  }, [showAuthScreen])

  // Load unlocked insights from cached chat data
  useEffect(() => {
    if (chat?.unlockedInsights) {
      setUnlockedInsights(new Set(chat.unlockedInsights))
    }
  }, [chat])

  // Helper to check if an insight should be shown as unlocked
  const isInsightUnlocked = (insightId: string): boolean => {
    const unlocked = unlockedInsights.has(insightId)
    console.log(`Checking if ${insightId} is unlocked:`, unlocked, 'All unlocked:', Array.from(unlockedInsights))
    return unlocked
  }

  // Helper to get frequency label from count
  const getFrequencyLabel = (count: number): string => {
    if (count === 0) return 'None'
    if (count === 1) return 'Rare'
    if (count <= 3) return 'Few'
    if (count <= 7) return 'Occasional'
    if (count <= 15) return 'Moderate'
    if (count <= 25) return 'Frequent'
    return 'Very Frequent'
  }

  // Handle tab change - insights tab is always accessible to see locked cards
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
  }

  // Handle unlock insight - check access and show paywall or unlock
  const handleUnlockInsight = async (insightId: string) => {
    console.log('🔓 handleUnlockInsight called for:', insightId)
    console.log('Current unlockedInsights:', Array.from(unlockedInsights))

    // First access check - show paywall if no access
    const access = await PaymentService.hasAccess(chatId)
    console.log('Initial access check result:', access)

    if (!access) {
      // No access - show paywall and remember which insight to unlock after payment
      console.log('❌ No access - showing paywall')
      setPendingInsightToUnlock(insightId)
      setShowPaywall(true)
      return
    }

    // Has access - unlock this specific insight
    if (unlockedInsights.has(insightId)) {
      // Already unlocked, do nothing
      console.log('✅ Insight already unlocked')
      return
    }

    console.log('🔄 Starting unlock process...')
    setLoadingInsight(insightId)

    try {
      // CRITICAL: Triple-check access with explicit chatId right before unlocking
      // This prevents race conditions and ensures entitlement is valid for THIS specific chat
      const reconfirmAccess = await PaymentService.hasAccess(chatId)
      console.log('🔒 Re-confirming access before unlock:', reconfirmAccess)

      if (!reconfirmAccess) {
        console.error('❌ Access verification failed - aborting unlock')
        setLoadingInsight(null)
        setShowPaywall(true)
        showAlert('Access Required', 'Please complete payment to unlock insights')
        return
      }

      // If we don't have any AI insights yet, generate them all
      let insights = aiInsights
      if (!aiInsights && chat) {
        console.log('📊 Generating AI insights...')
        insights = await analyzeChat(chat.text)
        setAiInsights(insights)
        console.log('✅ AI insights generated')

        // Assign this one-time purchase to this specific chat (only on first unlock and only for one-time purchases)
        // Skip this for subscriptions
        const hasSubscription = await PaymentService.hasActiveSubscription()
        if (!hasSubscription) {
          console.log('🔗 Assigning one-time entitlement to chat...')
          try {
            await PaymentService.assignAnalysisToChat(chatId)
            console.log('✅ Entitlement assigned to chat')
          } catch (assignError) {
            console.error('❌ Failed to assign entitlement:', assignError)
            // If assignment fails, user might not have valid payment - abort
            setLoadingInsight(null)
            setShowPaywall(true)
            showAlert(
              'Payment Verification Failed',
              'Could not verify your payment. Please try again or contact support.'
            )
            return
          }
        } else {
          console.log('ℹ️ Subscription active - no need to assign to chat')
        }
      }

      // FINAL VERIFICATION: Check access one more time after assignment
      const finalAccessCheck = await PaymentService.hasAccess(chatId)
      if (!finalAccessCheck) {
        console.error('❌ Final access check failed after assignment')
        setLoadingInsight(null)
        setShowPaywall(true)
        showAlert('Access Verification Failed', 'Could not verify access. Please try again.')
        return
      }

      // Mark this insight as unlocked and persist it
      const newUnlockedInsights = new Set([...unlockedInsights, insightId])
      console.log('New unlockedInsights:', Array.from(newUnlockedInsights))
      setUnlockedInsights(newUnlockedInsights)

      // Save to storage
      if (analysis) {
        console.log('💾 Saving to storage...')
        await updateChatAnalysis(chatId, analysis, insights || undefined, Array.from(newUnlockedInsights))
        console.log('✅ Saved to storage')
      } else {
        console.warn('⚠️ No analysis to save!')
      }

      console.log('🎉 Unlock complete!')
    } catch (err) {
      console.error('❌ Error Unlocking Insight:', err)
      showAlert(
        'Failed to Unlock Insight',
        "Don't worry, this can happen sometimes due to the AI being overloaded. Simply try again in a few seconds."
      )
    } finally {
      setLoadingInsight(null)
    }
  }

  // Handle purchase
  const handlePurchase = async (planId: string) => {
    try {
      console.log('💳 Starting payment for plan:', planId)

      // Initialize Stripe payment - this will show the payment sheet
      const result = await StripeService.initializePayment(planId)

      console.log('💳 Payment result:', result)

      if (result.success) {
        console.log('✅ Payment sheet returned success')

        // Store payment intent ID for verification
        const paymentIntentId = result.paymentIntentId

        // Close paywall immediately to improve UX
        setShowPaywall(false)

        // Show a brief success message
        showAlert('Payment Processing', 'Your payment is being processed. You can unlock insights in a moment.')

        // Check if user is authenticated
        const isAuthenticated = await AuthService.isAuthenticated()
        console.log('🔐 User authenticated:', isAuthenticated)

        if (!isAuthenticated) {
          // Show auth screen to secure the purchase
          console.log('📝 Showing auth screen (showAuthScreen = true)')
          setShowAuthScreen(true)
        } else {
          // Already authenticated - switch to insights tab
          console.log('✅ Already authenticated, switching to insights tab')
          setActiveTab('insights')
        }

        // CRITICAL: Poll for entitlement creation
        // Webhooks can be delayed or fail, so we need to wait for the entitlement to appear
        console.log('⏳ Polling for entitlement creation...')
        const maxAttempts = 10 // 10 attempts over 10 seconds
        const pollInterval = 1000 // 1 second between attempts

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`🔄 Polling attempt ${attempt}/${maxAttempts}`)

          // Wait before checking (except first attempt)
          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval))
          } else {
            // First attempt - wait just 500ms to give webhook a head start
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          // Check if entitlement exists now
          const hasAccess = await PaymentService.hasAccess(chatId)
          console.log(`🔍 Attempt ${attempt}: hasAccess =`, hasAccess)

          if (hasAccess) {
            console.log('✅ Entitlement found! Payment confirmed.')
            showAlert('🎉 Payment Successful!', 'Unlocking your insight now...')

            // Automatically unlock the pending insight
            if (pendingInsightToUnlock) {
              console.log('🔓 Auto-unlocking pending insight:', pendingInsightToUnlock)
              setTimeout(() => handleUnlockInsight(pendingInsightToUnlock), 500)
              setPendingInsightToUnlock(null)
            }
            break
          }

          // If we've exhausted attempts, try manual verification
          if (attempt === maxAttempts) {
            console.warn('⚠️ Entitlement not found after polling - attempting manual verification')

            if (paymentIntentId) {
              console.log('🔧 Calling manual verification fallback...')
              const verified = await PaymentService.verifyPayment(paymentIntentId, planId, chatId)

              if (verified) {
                console.log('✅ Manual verification succeeded!')
                showAlert('🎉 Payment Verified!', 'Unlocking your insight now...')

                // Automatically unlock the pending insight
                if (pendingInsightToUnlock) {
                  console.log('🔓 Auto-unlocking pending insight:', pendingInsightToUnlock)
                  setTimeout(() => handleUnlockInsight(pendingInsightToUnlock), 500)
                  setPendingInsightToUnlock(null)
                }
              } else {
                console.error('❌ Manual verification failed')
                showAlert(
                  '⏳ Payment Processing',
                  'Your payment was successful but verification is taking longer than expected. Please wait a moment and try unlocking again. If the problem persists, contact support.'
                )
              }
            } else {
              console.error('❌ No payment intent ID available for manual verification')
              showAlert(
                '⏳ Payment Processing',
                'Your payment was successful but verification is taking longer than expected. Please wait a moment and try unlocking again. If the problem persists, contact support.'
              )
            }
          }
        }
      } else {
        // Payment failed or cancelled
        console.log('❌ Payment failed or cancelled')
        if (result.error) {
          showAlert('Payment Failed', result.error)
        }
        // User cancelled - no alert needed (already handled by Stripe sheet dismissal)
      }
    } catch (error) {
      console.error('💥 Purchase error:', error)
      showAlert('Error', 'Failed to process payment. Please try again.')
    }
  }

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthScreen(false)
    setActiveTab('insights')
    showAlert('🎉 Account Created!', 'Your purchases are now secure and accessible from any device')
  }

  useEffect(() => {
    console.log('Analysis screen - chatId:', chatId)
    console.log('Analysis screen - chats count:', chats.length)
    console.log('Analysis screen - chats loading:', chatsLoading)
    console.log('Analysis screen - chat found:', !!chat)
    console.log('Analysis screen - cached analysis:', !!chat?.analysis)

    // Reset state ONLY when chatId changes
    if (previousChatIdRef.current !== chatId) {
      console.log('ChatId changed, resetting all state')
      setUnlockedInsights(new Set())
      setAiInsights(null)
      setAnalysis(null)
      setIsAnalyzing(false)
      setError(null)
      setShowLoadingAnimation(true)
      previousChatIdRef.current = chatId
    }

    // Don't do anything if chats are still loading
    if (chatsLoading) {
      console.log('Chats still loading, waiting...')
      return
    }

    if (!chat) {
      console.log('Chat not found for ID:', chatId)
      console.log(
        'Available chat IDs:',
        chats.map((c) => c.id)
      )
      setError('Chat not found')
      setIsAnalyzing(false)
      return
    }

    // Reset error state when chat is found
    setError(null)

    // If we already have analysis loaded, don't do anything
    if (analysis) {
      console.log('Analysis already loaded, skipping')
      return
    }

    // Check if we have cached analysis - load it immediately to prevent flashing
    if (chat.analysis && !analysis) {
      console.log('Using cached basic analysis')
      setAnalysis(chat.analysis)

      // Load cached AI insights if they exist (user has already unlocked some)
      if (chat.aiInsights) {
        console.log('Loading cached AI insights')
        setAiInsights(chat.aiInsights)
      }

      setIsAnalyzing(false)
      return
    }

    // If we don't have basic analysis and we're not already analyzing, run it
    if (!isAnalyzing) {
      console.log('No cached analysis found, performing basic analysis only')
      setIsAnalyzing(true)

      const performBasicAnalysis = async () => {
        try {
          const basicAnalysis = await analyzeChatData(chat.text)
          analysisRef.current = basicAnalysis

          // Save only basic analysis (no AI insights yet)
          await updateChatAnalysis(chatId, basicAnalysis)
          console.log('Basic analysis complete and cached')
        } catch (err) {
          console.error('Analysis error:', err)
          setError(err instanceof Error ? err.message : 'Failed to analyze chat')
          setIsAnalyzing(false)
        }
        // Do not set isAnalyzing=false or setAnalysis here; wait for animation
      }

      performBasicAnalysis()
    }
  }, [chat, chatId, chats, chatsLoading, updateChatAnalysis, analysis, isAnalyzing])

  // Always show AnalysisLoading when:
  // 1. Chats are still loading from Supabase, OR
  // 2. We don't have the analysis loaded yet, OR
  // 3. showLoadingAnimation is true (set on navigation)
  if (chatsLoading || !analysis || showLoadingAnimation) {
    console.log(
      'Showing AnalysisLoading: chatsLoading =',
      chatsLoading,
      'analysis =',
      !!analysis,
      'showLoadingAnimation =',
      showLoadingAnimation
    )
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AnalysisLoading
          key={chatId}
          onComplete={() => {
            console.log('AnalysisLoading complete')
            setIsAnalyzing(false)
            setShowLoadingAnimation(false)
            if (analysisRef.current) {
              setAnalysis(analysisRef.current)
              analysisRef.current = null
            }
          }}
        />
      </SafeAreaView>
    )
  }

  if (!chat && !chatsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Chat Not Found</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>
            The requested chat could not be found.
          </ThemedText>
          <ThemedButton
            title="Back to Chats"
            onPress={() => router.push('/chats' as any)}
            variant="primary"
            size="large"
          />
        </ThemedView>
      </SafeAreaView>
    )
  }

  // Only show error screen if there's an actual error AND we're not analyzing
  if (error && !isAnalyzing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Analysis Error</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>{error}</ThemedText>
          <ThemedButton title="Go Back" onPress={() => router.back()} variant="primary" size="large" />
        </ThemedView>
      </SafeAreaView>
    )
  }

  // If we don't have analysis yet, we should be showing the loading screen (handled above)
  // This shouldn't render, but just in case
  if (!analysis) {
    return null
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerTop}>
          <BackButton />
          <ThemedText type="title" style={[styles.title, { color: theme.colors.text }]}>
            Chat Analysis
          </ThemedText>
        </View>

        {/* Tab Navigation */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
          ]}
        >
          <ThemedTabButton
            label="Overview"
            icon="chart-box-outline"
            isActive={activeTab === 'overview'}
            onPress={() => handleTabChange('overview')}
          />
          <ThemedTabButton
            label="Insights"
            icon="auto-fix"
            isActive={activeTab === 'insights'}
            onPress={() => handleTabChange('insights')}
          />
        </View>
      </View>

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
            <View style={styles.statsGrid}>
              {/* Total Messages Card */}
              <SimpleStatCard title="Total Messages" icon="💬" value={analysis.totalMessages} />

              {/* Messages per Participant Card */}
              <ComparisonCard
                title="Messages per Participant"
                icon="👥"
                participants={[
                  {
                    name: analysis.participant1.name,
                    value: analysis.participant1.messageCount,
                  },
                  {
                    name: analysis.participant2.name,
                    value: analysis.participant2.messageCount,
                  },
                ]}
              />

              {/* Response Time Card */}
              <ComparisonCard
                title="Average Response Time"
                icon="⏱️"
                participants={[
                  {
                    name: analysis.participant1.name,
                    value:
                      analysis.participant1.averageResponseTime < 1
                        ? `${Math.round(analysis.participant1.averageResponseTime * 60)}m`
                        : `${analysis.participant1.averageResponseTime.toFixed(1)}h`,
                  },
                  {
                    name: analysis.participant2.name,
                    value:
                      analysis.participant2.averageResponseTime < 1
                        ? `${Math.round(analysis.participant2.averageResponseTime * 60)}m`
                        : `${analysis.participant2.averageResponseTime.toFixed(1)}h`,
                  },
                ]}
              />

              {/* Average Message Length Card */}
              <ComparisonCard
                title="Average Message Length"
                icon="📝"
                participants={[
                  {
                    name: analysis.participant1.name,
                    value: `${analysis.participant1.averageMessageLength} chars`,
                  },
                  {
                    name: analysis.participant2.name,
                    value: `${analysis.participant2.averageMessageLength} chars`,
                  },
                ]}
              />

              {/* Initiation Rate Card */}
              {analysis.participant1.initiationRate !== undefined && (
                <ComparisonCard
                  title="Initiation Rate"
                  icon="🚀"
                  description={
                    (analysis.participant1.initiationRate ?? 0) > (analysis.participant2.initiationRate ?? 0)
                      ? `This indicates that ${analysis.participant1.name} starts conversations more often than ${analysis.participant2.name}, which may suggest a higher level of interest or eagerness to engage.`
                      : (analysis.participant2.initiationRate ?? 0) > (analysis.participant1.initiationRate ?? 0)
                      ? `This indicates that ${analysis.participant2.name} starts conversations more often than ${analysis.participant1.name}, which may suggest a higher level of interest or eagerness to engage.`
                      : `Both participants initiate conversations equally, indicating a balanced level of interest and engagement from both sides.`
                  }
                  participants={[
                    {
                      name: analysis.participant1.name,
                      value: `${analysis.participant1.initiationRate}%`,
                      progressValue: analysis.participant1.initiationRate,
                      progressColor: theme.colors.info,
                    },
                    {
                      name: analysis.participant2.name,
                      value: `${analysis.participant2.initiationRate ?? 0}%`,
                      progressValue: analysis.participant2.initiationRate ?? 0,
                      progressColor: theme.colors.error,
                    },
                  ]}
                />
              )}

              {/* Interest Level Card */}
              <ComparisonCard
                title="Interest Level"
                icon="❤️"
                description={
                  analysis.participant1.interestLevel > analysis.participant2.interestLevel
                    ? `${analysis.participant1.name} shows a higher overall engagement score (${analysis.participant1.interestLevel}%) compared to ${analysis.participant2.name} (${analysis.participant2.interestLevel}%), based on response time, message length, and frequency. This suggests ${analysis.participant1.name} may be more invested in the conversation.`
                    : analysis.participant2.interestLevel > analysis.participant1.interestLevel
                    ? `${analysis.participant2.name} shows a higher overall engagement score (${analysis.participant2.interestLevel}%) compared to ${analysis.participant1.name} (${analysis.participant1.interestLevel}%), based on response time, message length, and frequency. This suggests ${analysis.participant2.name} may be more invested in the conversation.`
                    : `Both participants show equal engagement levels (${analysis.participant1.interestLevel}%), indicating a balanced investment in the conversation from both sides.`
                }
                participants={[
                  {
                    name: analysis.participant1.name,
                    value: `${analysis.participant1.interestLevel}%`,
                    progressValue: analysis.participant1.interestLevel,
                    progressColor: theme.colors.info,
                  },
                  {
                    name: analysis.participant2.name,
                    value: `${analysis.participant2.interestLevel}%`,
                    progressValue: analysis.participant2.interestLevel,
                    progressColor: theme.colors.error,
                  },
                ]}
              />
            </View>
          ) : (
            <View style={styles.insightsContainer}>
              {/* Red Flags */}
              {isInsightUnlocked('redFlags') && aiInsights ? (
                <InsightCard
                  icon="🚩"
                  title="Red Flags"
                  description={aiInsights.redFlags.description}
                  items={aiInsights.redFlags.items}
                  badge={{ text: `${aiInsights.redFlags.count} Found`, color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="🚩"
                  title="Red Flags"
                  onUnlock={() => handleUnlockInsight('redFlags')}
                  isLoading={loadingInsight === 'redFlags'}
                  unlockText="What are the warning signs?"
                />
              )}

              {/* Green Flags */}
              {isInsightUnlocked('greenFlags') && aiInsights ? (
                <InsightCard
                  icon="✅"
                  title="Green Flags"
                  description={aiInsights.greenFlags.description}
                  items={aiInsights.greenFlags.items}
                  badge={{ text: `${aiInsights.greenFlags.count} Found`, color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="✅"
                  title="Green Flags"
                  onUnlock={() => handleUnlockInsight('greenFlags')}
                  isLoading={loadingInsight === 'greenFlags'}
                  unlockText="What are the positive signs?"
                />
              )}

              {/* Attachment Style */}
              {isInsightUnlocked('attachmentStyle') && aiInsights ? (
                <InsightCard
                  icon="🔗"
                  title="Attachment Style"
                  description={aiInsights.attachmentStyle.description}
                  items={aiInsights.attachmentStyle.items}
                  badge={{ text: aiInsights.attachmentStyle.type, color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="🔗"
                  title="Attachment Style"
                  onUnlock={() => handleUnlockInsight('attachmentStyle')}
                  isLoading={loadingInsight === 'attachmentStyle'}
                  unlockText="What's the attachment pattern?"
                />
              )}

              {/* Reciprocity Score */}
              {isInsightUnlocked('reciprocityScore') && aiInsights ? (
                <InsightCard
                  icon="⚖️"
                  title="Reciprocity Score"
                  description={aiInsights.reciprocityScore.description}
                  items={aiInsights.reciprocityScore.items}
                  badge={{
                    text: `${aiInsights.reciprocityScore.percentage}% ${aiInsights.reciprocityScore.rating}`,
                    color: theme.colors.primary,
                  }}
                />
              ) : (
                <LockedInsightCard
                  icon="⚖️"
                  title="Reciprocity Score"
                  onUnlock={() => handleUnlockInsight('reciprocityScore')}
                  isLoading={loadingInsight === 'reciprocityScore'}
                  unlockText="How balanced is this relationship?"
                />
              )}

              {/* Compliments */}
              {isInsightUnlocked('compliments') && aiInsights ? (
                <InsightCard
                  icon="💐"
                  title="Compliments"
                  description={aiInsights.compliments.description}
                  items={aiInsights.compliments.items}
                  badge={{ text: getFrequencyLabel(aiInsights.compliments.count), color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="💐"
                  title="Compliments"
                  onUnlock={() => handleUnlockInsight('compliments')}
                  isLoading={loadingInsight === 'compliments'}
                  unlockText="How often do they compliment?"
                />
              )}

              {/* Criticism */}
              {isInsightUnlocked('criticism') && aiInsights ? (
                <InsightCard
                  icon="⚠️"
                  title="Criticism"
                  description={aiInsights.criticism.description}
                  items={aiInsights.criticism.items}
                  badge={{ text: getFrequencyLabel(aiInsights.criticism.count), color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="⚠️"
                  title="Criticism"
                  onUnlock={() => handleUnlockInsight('criticism')}
                  isLoading={loadingInsight === 'criticism'}
                  unlockText="Are there critical moments?"
                />
              )}

              {/* Compatibility Score */}
              {isInsightUnlocked('compatibilityScore') && aiInsights ? (
                <InsightCard
                  icon="💯"
                  title="Compatibility Score"
                  description={aiInsights.compatibilityScore.description}
                  items={aiInsights.compatibilityScore.items}
                  badge={{
                    text: `${aiInsights.compatibilityScore.percentage}% ${aiInsights.compatibilityScore.rating}`,
                    color: theme.colors.primary,
                  }}
                />
              ) : (
                <LockedInsightCard
                  icon="💯"
                  title="Compatibility Score"
                  onUnlock={() => handleUnlockInsight('compatibilityScore')}
                  isLoading={loadingInsight === 'compatibilityScore'}
                  unlockText="How compatible are you?"
                />
              )}

              {/* Relationship Tips */}
              {isInsightUnlocked('relationshipTips') && aiInsights ? (
                <InsightCard
                  icon="💡"
                  title="Relationship Tips"
                  description={aiInsights.relationshipTips.description}
                  items={aiInsights.relationshipTips.tips}
                  badge={{ text: `${aiInsights.relationshipTips.count} Found`, color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="💡"
                  title="Relationship Tips"
                  onUnlock={() => handleUnlockInsight('relationshipTips')}
                  isLoading={loadingInsight === 'relationshipTips'}
                  unlockText="What can you improve?"
                />
              )}
            </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backButton: {
    padding: 0,
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
  title: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsGrid: {
    marginTop: 12,
  },
  insightsContainer: {
    marginTop: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
    letterSpacing: 0.1,
  },
})
