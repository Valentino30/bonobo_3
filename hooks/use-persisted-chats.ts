import {
  useAddChatMutation,
  useChatsQuery,
  useClearAllChatsMutation,
  useDeleteChatMutation,
  useUpdateChatAnalysisMutation,
} from '@/hooks/queries/use-chats-query'
import type { AIInsights } from '@/utils/ai-service'
import type { ChatAnalysisData, StoredChat } from '@/utils/chat-storage'

/**
 * Hook for managing persisted chats using React Query
 * Provides automatic caching, optimistic updates, and cache invalidation
 */
export function usePersistedChats() {
  const { data: chats = [], isLoading, refetch: refreshChats } = useChatsQuery()
  const addChatMutation = useAddChatMutation()
  const deleteChatMutation = useDeleteChatMutation()
  const clearAllMutation = useClearAllChatsMutation()
  const updateAnalysisMutation = useUpdateChatAnalysisMutation()

  const addChat = async (chat: StoredChat) => {
    await addChatMutation.mutateAsync(chat)
  }

  const deleteChat = async (chatId: string) => {
    await deleteChatMutation.mutateAsync(chatId)
  }

  const clearAllChats = async () => {
    await clearAllMutation.mutateAsync()
  }

  const updateChatAnalysis = async (
    chatId: string,
    analysis: ChatAnalysisData,
    aiInsights?: AIInsights,
    unlockedInsights?: string[]
  ) => {
    await updateAnalysisMutation.mutateAsync({
      chatId,
      analysis,
      aiInsights,
      unlockedInsights,
    })
  }

  return {
    chats,
    isLoading,
    addChat,
    deleteChat,
    clearAllChats,
    refreshChats,
    updateChatAnalysis,
  }
}
