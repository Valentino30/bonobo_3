import { useLocalSearchParams } from 'expo-router'
import { useAnalysisQuery } from '@/hooks/queries/use-analysis-query'
import { useChatQuery } from '@/hooks/queries/use-chats-query'

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

/**
 * Hook for fetching and managing chat analysis data
 * Focuses solely on data fetching and state
 */
export function useChatAnalysis() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>()

  // React Query hooks
  const { data: chat, isLoading: chatsLoading, error: chatError } = useChatQuery(chatId)

  const {
    data: analysis,
    isLoading: isAnalyzing,
    error: analysisError,
  } = useAnalysisQuery(chatId, chat?.text || '', !!chat)

  // Derived state
  const aiInsights = chat?.aiInsights || null
  const error = chatError?.message || analysisError?.message || null

  return {
    chat,
    chatId,
    chatsLoading,
    analysis,
    aiInsights,
    isAnalyzing,
    error,
  }
}
