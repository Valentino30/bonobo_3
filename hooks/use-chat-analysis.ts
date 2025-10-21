import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAnalysisQuery, useUnlockInsightMutation } from '@/hooks/queries/use-analysis-query'
import { useChatQuery, useUpdateChatAnalysisMutation } from '@/hooks/queries/use-chats-query'
import { usePurchaseMutation } from '@/hooks/queries/use-purchase-mutation'
import { getFrequencyLabel } from '@/utils/insight-helpers'

type TabType = 'overview' | 'insights'

type ParticipantData = {
  name: string
  messageCount: number
  averageResponseTime: number
  interestLevel: number
  initiationRate?: number
  averageMessageLength?: number
}

export interface ChatAnalysisData {
  totalMessages: number
  participant1: ParticipantData
  participant2: ParticipantData
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
 * Refactored to use React Query for data fetching and caching
 */
export function useChatAnalysis({ showAlert }: UseChatAnalysisOptions) {
  const router = useRouter()
  const { chatId } = useLocalSearchParams<{ chatId: string }>()

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuthScreen, setShowAuthScreen] = useState(false)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)
  const [pendingInsightToUnlock, setPendingInsightToUnlock] = useState<string | null>(null)

  // React Query hooks
  const { data: chat, isLoading: chatsLoading, error: chatError } = useChatQuery(chatId)

  const {
    data: analysis,
    isLoading: isAnalyzing,
    error: analysisError,
  } = useAnalysisQuery(chatId, chat?.text || '', !!chat)

  const unlockInsightMutation = useUnlockInsightMutation()
  const purchaseMutation = usePurchaseMutation()
  const updateAnalysisMutation = useUpdateChatAnalysisMutation()

  // Derived state
  const unlockedInsights = new Set(chat?.unlockedInsights || [])
  const aiInsights = chat?.aiInsights || null
  const error = chatError?.message || analysisError?.message || null
  const loadingInsight = unlockInsightMutation.isPending ? pendingInsightToUnlock : null

  // Helper: Check if an insight is unlocked
  const isInsightUnlocked = (insightId: string): boolean => {
    return unlockedInsights.has(insightId)
  }

  // Handler: Change tab
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
  }

  // Handler: Unlock insight
  const handleUnlockInsight = async (insightId: string) => {
    if (!chat) return

    setPendingInsightToUnlock(insightId)

    try {
      await unlockInsightMutation.mutateAsync({
        chatId,
        insightId,
        chatText: chat.text,
      })

      // Update persistent storage
      if (analysis) {
        await updateAnalysisMutation.mutateAsync({
          chatId,
          analysis,
          aiInsights: unlockInsightMutation.data?.insights,
          unlockedInsights: [...unlockedInsights, insightId],
        })
      }
    } catch (error: any) {
      if (error.message === 'NO_ACCESS') {
        setPendingInsightToUnlock(insightId)
        setShowPaywall(true)
      } else {
        showAlert(
          'Failed to Unlock Insight',
          "Don't worry, this can happen sometimes due to the AI being overloaded. Simply try again in a few seconds."
        )
      }
    } finally {
      setPendingInsightToUnlock(null)
    }
  }

  // Handler: Purchase
  const handlePurchase = async (planId: string) => {
    try {
      const result = await purchaseMutation.mutateAsync({
        planId,
        chatId,
      })

      showAlert('Payment Processing', 'Your payment is being processed. You can unlock insights in a moment.')

      if (result.requiresAuth) {
        setShowAuthScreen(true)
      } else {
        setActiveTab('insights')
      }

      if (result.success) {
        showAlert('🎉 Payment Successful!', 'Unlocking your insight now...')

        // Unlock pending insight after successful payment
        if (pendingInsightToUnlock) {
          setTimeout(() => handleUnlockInsight(pendingInsightToUnlock), 500)
          setPendingInsightToUnlock(null)
        }
      }
    } catch (error: any) {
      if (error.message === 'VERIFICATION_TIMEOUT') {
        showAlert(
          '⏳ Payment Processing',
          'Your payment was successful but verification is taking longer than expected. Please wait a moment and try unlocking again. If the problem persists, contact support.'
        )
      } else {
        showAlert('Payment Failed', error.message || 'Failed to process payment. Please try again.')
      }
    }
  }

  // Handler: Auth success
  const handleAuthSuccess = () => {
    setShowAuthScreen(false)
    setActiveTab('insights')
    showAlert('🎉 Account Created!', 'Your purchases are now secure and accessible from any device')
  }

  // Handler: Loading animation complete
  const handleLoadingComplete = () => {
    setShowLoadingAnimation(false)
  }

  // Handler: Go back
  const handleGoBack = () => {
    router.back()
  }

  // Handler: Navigate to chats
  const handleNavigateToChats = () => {
    router.push('/chats' as any)
  }

  return {
    // Data
    chat,
    chatId,
    chats: [], // Not needed with individual chat query
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
