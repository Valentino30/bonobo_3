import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAnalysisQuery, useUnlockInsightMutation } from '@/hooks/queries/use-analysis-query'
import { useChatQuery } from '@/hooks/queries/use-chats-query'
import { usePurchaseMutation } from '@/hooks/queries/use-purchase-mutation'
import i18n from '@/i18n/config'
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
    if (!chat || !analysis) return

    setPendingInsightToUnlock(insightId)

    try {
      await unlockInsightMutation.mutateAsync({
        chatId,
        insightId,
        chatText: chat.text,
        analysis,
      })
      // Mutation handles persistence to Supabase in onSuccess
    } catch (error: any) {
      if (error.message === 'NO_ACCESS') {
        setPendingInsightToUnlock(insightId)
        setShowPaywall(true)
      } else {
        showAlert(i18n.t('analysisErrors.failedToUnlock'), i18n.t('analysisErrors.failedToUnlockMessage'))
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

      showAlert(i18n.t('analysisErrors.paymentProcessing'), i18n.t('analysisErrors.paymentProcessingMessage'))

      if (result.requiresAuth) {
        setShowAuthScreen(true)
      } else {
        setActiveTab('insights')
      }

      if (result.success) {
        showAlert(i18n.t('analysisErrors.paymentSuccessful'), i18n.t('analysisErrors.paymentSuccessfulMessage'))

        // Unlock pending insight after successful payment
        if (pendingInsightToUnlock) {
          setTimeout(() => handleUnlockInsight(pendingInsightToUnlock), 500)
          setPendingInsightToUnlock(null)
        }
      }
    } catch (error: any) {
      if (error.message === 'VERIFICATION_TIMEOUT') {
        showAlert(i18n.t('analysisErrors.verificationTimeout'), i18n.t('analysisErrors.verificationTimeoutMessage'))
      } else {
        showAlert(i18n.t('analysisErrors.paymentFailed'), error.message || i18n.t('analysisErrors.paymentFailed'))
      }
    }
  }

  // Handler: Auth success
  const handleAuthSuccess = () => {
    setShowAuthScreen(false)
    setActiveTab('insights')
    showAlert(i18n.t('analysisErrors.accountCreatedSuccess'), i18n.t('analysisErrors.accountCreatedSuccessMessage'))
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
