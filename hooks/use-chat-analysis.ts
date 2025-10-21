import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { type AIInsights, analyzeChat } from '@/utils/ai-service'
import { AuthService } from '@/utils/auth-service'
import { analyzeChatData } from '@/utils/chat-analyzer'
import { PaymentService } from '@/utils/payment-service'
import { StripeService } from '@/utils/stripe-service'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'

type TabType = 'overview' | 'insights'

export interface ChatAnalysisData {
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

type UseChatAnalysisOptions = {
  showAlert: (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => void
}

/**
 * Comprehensive hook that manages all business logic for chat analysis
 * Handles analysis, AI insights, payments, and authentication
 */
export function useChatAnalysis({ showAlert }: UseChatAnalysisOptions) {
  const router = useRouter()
  const { chatId } = useLocalSearchParams<{ chatId: string }>()
  const { chats, isLoading: chatsLoading, updateChatAnalysis } = usePersistedChats()
  const analysisRef = useRef<ChatAnalysisData | null>(null)
  const previousChatIdRef = useRef<string | null>(null)

  const chat = chats.find((c) => c.id === chatId)

  // State management
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

  // Debug: Log auth screen changes
  useEffect(() => {
    console.log('🔵 showAuthScreen state changed:', showAuthScreen)
  }, [showAuthScreen])

  // Load unlocked insights from cached chat data
  useEffect(() => {
    if (chat?.unlockedInsights) {
      setUnlockedInsights(new Set(chat.unlockedInsights))
    }
  }, [chat])

  // Helper: Check if an insight is unlocked
  const isInsightUnlocked = (insightId: string): boolean => {
    const unlocked = unlockedInsights.has(insightId)
    console.log(`Checking if ${insightId} is unlocked:`, unlocked, 'All unlocked:', Array.from(unlockedInsights))
    return unlocked
  }

  // Helper: Get frequency label from count
  const getFrequencyLabel = (count: number): string => {
    if (count === 0) return 'None'
    if (count === 1) return 'Rare'
    if (count <= 3) return 'Few'
    if (count <= 7) return 'Occasional'
    if (count <= 15) return 'Moderate'
    if (count <= 25) return 'Frequent'
    return 'Very Frequent'
  }

  // Handle tab change
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
  }

  // Handle unlock insight
  const handleUnlockInsight = async (insightId: string) => {
    console.log('🔓 handleUnlockInsight called for:', insightId)
    console.log('Current unlockedInsights:', Array.from(unlockedInsights))

    // First access check - show paywall if no access
    const access = await PaymentService.hasAccess(chatId)
    console.log('Initial access check result:', access)

    if (!access) {
      console.log('❌ No access - showing paywall')
      setPendingInsightToUnlock(insightId)
      setShowPaywall(true)
      return
    }

    // Has access - unlock this specific insight
    if (unlockedInsights.has(insightId)) {
      console.log('✅ Insight already unlocked')
      return
    }

    console.log('🔄 Starting unlock process...')
    setLoadingInsight(insightId)

    try {
      // Triple-check access
      const reconfirmAccess = await PaymentService.hasAccess(chatId)
      console.log('🔒 Re-confirming access before unlock:', reconfirmAccess)

      if (!reconfirmAccess) {
        console.error('❌ Access verification failed - aborting unlock')
        setLoadingInsight(null)
        setShowPaywall(true)
        showAlert('Access Required', 'Please complete payment to unlock insights')
        return
      }

      // Generate AI insights if needed
      let insights = aiInsights
      if (!aiInsights && chat) {
        console.log('📊 Generating AI insights...')
        insights = await analyzeChat(chat.text)
        setAiInsights(insights)
        console.log('✅ AI insights generated')

        // Assign one-time purchase to chat (skip for subscriptions)
        const hasSubscription = await PaymentService.hasActiveSubscription()
        if (!hasSubscription) {
          console.log('🔗 Assigning one-time entitlement to chat...')
          try {
            await PaymentService.assignAnalysisToChat(chatId)
            console.log('✅ Entitlement assigned to chat')
          } catch (assignError) {
            console.error('❌ Failed to assign entitlement:', assignError)
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

      // Final verification
      const finalAccessCheck = await PaymentService.hasAccess(chatId)
      if (!finalAccessCheck) {
        console.error('❌ Final access check failed after assignment')
        setLoadingInsight(null)
        setShowPaywall(true)
        showAlert('Access Verification Failed', 'Could not verify access. Please try again.')
        return
      }

      // Mark insight as unlocked and persist
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
      console.log('💳 Starting payment for plan:', planId, 'chatId:', chatId)

      const result = await StripeService.initializePayment(planId, chatId as string)
      console.log('💳 Payment result:', result)

      if (result.success) {
        console.log('✅ Payment sheet returned success')

        const paymentIntentId = result.paymentIntentId
        setShowPaywall(false)
        showAlert('Payment Processing', 'Your payment is being processed. You can unlock insights in a moment.')

        // Check authentication
        const isAuthenticated = await AuthService.isAuthenticated()
        console.log('🔐 User authenticated:', isAuthenticated)

        if (!isAuthenticated) {
          console.log('📝 Showing auth screen (showAuthScreen = true)')
          setShowAuthScreen(true)
        } else {
          console.log('✅ Already authenticated, switching to insights tab')
          setActiveTab('insights')
        }

        // Poll for entitlement
        console.log('⏳ Polling for entitlement creation...')
        const maxAttempts = 10
        const pollInterval = 1000

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`🔄 Polling attempt ${attempt}/${maxAttempts}`)

          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval))
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          const hasAccess = await PaymentService.hasAccess(chatId)
          console.log(`🔍 Attempt ${attempt}: hasAccess =`, hasAccess)

          if (hasAccess) {
            console.log('✅ Entitlement found! Payment confirmed.')
            showAlert('🎉 Payment Successful!', 'Unlocking your insight now...')

            if (pendingInsightToUnlock) {
              console.log('🔓 Auto-unlocking pending insight:', pendingInsightToUnlock)
              setTimeout(() => handleUnlockInsight(pendingInsightToUnlock), 500)
              setPendingInsightToUnlock(null)
            }
            break
          }

          // Manual verification fallback
          if (attempt === maxAttempts) {
            console.warn('⚠️ Entitlement not found after polling - attempting manual verification')

            if (paymentIntentId) {
              console.log('🔧 Calling manual verification fallback...')
              const verified = await PaymentService.verifyPayment(paymentIntentId, planId, chatId)

              if (verified) {
                console.log('✅ Manual verification succeeded!')
                showAlert('🎉 Payment Verified!', 'Unlocking your insight now...')

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
        console.log('❌ Payment failed or cancelled')
        if (result.error) {
          showAlert('Payment Failed', result.error)
        }
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

  // Handle loading animation complete
  const handleLoadingComplete = () => {
    console.log('AnalysisLoading complete')
    setIsAnalyzing(false)
    setShowLoadingAnimation(false)
    if (analysisRef.current) {
      setAnalysis(analysisRef.current)
      analysisRef.current = null
    }
  }

  // Handle back navigation
  const handleGoBack = () => {
    router.back()
  }

  // Handle navigate to chats
  const handleNavigateToChats = () => {
    router.push('/chats' as any)
  }

  // Main analysis effect
  useEffect(() => {
    console.log('Analysis screen - chatId:', chatId)
    console.log('Analysis screen - chats count:', chats.length)
    console.log('Analysis screen - chats loading:', chatsLoading)
    console.log('Analysis screen - chat found:', !!chat)
    console.log('Analysis screen - cached analysis:', !!chat?.analysis)

    // Reset state when chatId changes
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

    // Wait for chats to load
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

    setError(null)

    // Skip if analysis already loaded
    if (analysis) {
      console.log('Analysis already loaded, skipping')
      return
    }

    // Load cached analysis
    if (chat.analysis && !analysis) {
      console.log('Using cached basic analysis')
      setAnalysis(chat.analysis)

      if (chat.aiInsights) {
        console.log('Loading cached AI insights')
        setAiInsights(chat.aiInsights)
      }

      setIsAnalyzing(false)
      return
    }

    // Perform basic analysis if needed
    if (!isAnalyzing) {
      console.log('No cached analysis found, performing basic analysis only')
      setIsAnalyzing(true)

      const performBasicAnalysis = async () => {
        try {
          const basicAnalysis = await analyzeChatData(chat.text)
          analysisRef.current = basicAnalysis
          await updateChatAnalysis(chatId, basicAnalysis)
          console.log('Basic analysis complete and cached')
        } catch (err) {
          console.error('Analysis error:', err)
          setError(err instanceof Error ? err.message : 'Failed to analyze chat')
          setIsAnalyzing(false)
        }
      }

      performBasicAnalysis()
    }
  }, [chat, chatId, chats, chatsLoading, updateChatAnalysis, analysis, isAnalyzing])

  return {
    // Data
    chat,
    chatId,
    chats,
    chatsLoading,
    analysis,
    aiInsights,
    isAnalyzing,
    showLoadingAnimation,
    error,
    activeTab,
    showPaywall,
    showAuthScreen,
    unlockedInsights,
    loadingInsight,

    // Setters
    setShowPaywall,
    setShowAuthScreen,

    // Helpers
    isInsightUnlocked,
    getFrequencyLabel,

    // Handlers
    handleTabChange,
    handleUnlockInsight,
    handlePurchase,
    handleAuthSuccess,
    handleLoadingComplete,
    handleGoBack,
    handleNavigateToChats,
  }
}
