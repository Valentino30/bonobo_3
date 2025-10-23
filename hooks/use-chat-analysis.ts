import { useLocalSearchParams } from 'expo-router'
import { useAnalysisQuery } from '@/hooks/queries/use-analysis-query'
import { useChatQuery } from '@/hooks/queries/use-chats-query'

// Re-export shared types for backward compatibility
export type { ChatAnalysisData, ParticipantStats } from '@/types/chat-analysis'

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
