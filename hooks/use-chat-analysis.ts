import { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { usePurchase } from '@/hooks/use-purchase'
import { useUnlockInsight } from '@/hooks/use-unlock-insight'
import { type AIInsights } from '@/utils/ai-service'
import { analyzeChatData } from '@/utils/chat-analyzer'
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

  // Use purchase hook (must be before useUnlockInsight to access setPendingInsightToUnlock)
  const { setPendingInsightToUnlock, handlePurchase } = usePurchase({
    chatId,
    showAlert,
    onShowAuthScreen: () => setShowAuthScreen(true),
    onSwitchToInsightsTab: () => setActiveTab('insights'),
    onUnlockInsight: (insightId: string) => {
      // This will be set later after handleUnlockInsight is defined
      handleUnlockInsight(insightId)
    },
  })

  // Use unlock insight hook
  const { loadingInsight, handleUnlockInsight } = useUnlockInsight({
    chatId,
    chatText: chat?.text || '',
    aiInsights,
    unlockedInsights,
    analysis,
    setAiInsights,
    setUnlockedInsights,
    updateChatAnalysis,
    showAlert,
    onShowPaywall: (insightId: string) => {
      setPendingInsightToUnlock(insightId)
      setShowPaywall(true)
    },
  })

  // Load unlocked insights from cached chat data
  useEffect(() => {
    if (chat?.unlockedInsights) {
      setUnlockedInsights(new Set(chat.unlockedInsights))
    }
  }, [chat])

  // Helper: Check if an insight is unlocked
  const isInsightUnlocked = (insightId: string): boolean => {
    return unlockedInsights.has(insightId)
  }

  // Handle tab change
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
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
