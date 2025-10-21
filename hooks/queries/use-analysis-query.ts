import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type AIInsights, analyzeChat } from '@/utils/ai-service'
import { analyzeChatData } from '@/utils/chat-analyzer'
import type { StoredChat } from '@/utils/chat-storage'
import { PaymentService } from '@/utils/payment-service'
import { chatKeys } from './use-chats-query'

// Query keys
export const analysisKeys = {
  all: ['analysis'] as const,
  details: () => [...analysisKeys.all, 'detail'] as const,
  detail: (chatId: string) => [...analysisKeys.details(), chatId] as const,
  aiInsights: (chatId: string) => [...analysisKeys.all, 'ai', chatId] as const,
}

// Query: Get basic analysis for a chat
export function useAnalysisQuery(chatId: string, chatText: string, enabled: boolean = true) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: analysisKeys.detail(chatId),
    queryFn: async () => {
      // Check if already cached in chat
      const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
      if (chat?.analysis) {
        return chat.analysis
      }

      // Perform basic analysis
      const analysis = await analyzeChatData(chatText)
      return analysis
    },
    enabled: enabled && !!chatId && !!chatText,
    staleTime: Infinity, // Analysis never goes stale once computed
  })
}

// Query: Get AI insights for a chat
export function useAIInsightsQuery(chatId: string, chatText: string, enabled: boolean = false) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: analysisKeys.aiInsights(chatId),
    queryFn: async () => {
      // Check if already cached in chat
      const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
      if (chat?.aiInsights) {
        return chat.aiInsights
      }

      // Generate AI insights
      const insights = await analyzeChat(chatText)
      return insights
    },
    enabled: enabled && !!chatId && !!chatText,
    staleTime: Infinity, // AI insights never go stale once generated
  })
}

// Mutation: Unlock insight
export function useUnlockInsightMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ chatId, insightId, chatText }: { chatId: string; insightId: string; chatText: string }) => {
      // Check access
      const hasAccess = await PaymentService.hasAccess(chatId)
      if (!hasAccess) {
        throw new Error('NO_ACCESS')
      }

      // Get or generate AI insights
      let insights = queryClient.getQueryData<AIInsights>(analysisKeys.aiInsights(chatId))

      if (!insights) {
        const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
        insights = chat?.aiInsights || (await analyzeChat(chatText))

        // Assign one-time purchase to chat if needed
        const hasSubscription = await PaymentService.hasActiveSubscription()
        if (!hasSubscription) {
          await PaymentService.assignAnalysisToChat(chatId)
        }
      }

      return { chatId, insightId, insights }
    },
    onMutate: async ({ chatId, insightId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.detail(chatId) })

      const previousChat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))

      // Optimistically update unlocked insights
      queryClient.setQueryData<StoredChat | null>(chatKeys.detail(chatId), (old) =>
        old
          ? {
              ...old,
              unlockedInsights: [...(old.unlockedInsights || []), insightId],
            }
          : null
      )

      return { previousChat }
    },
    onError: (err, { chatId }, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(chatKeys.detail(chatId), context.previousChat)
      }
    },
    onSuccess: ({ chatId, insights }) => {
      // Update AI insights cache
      queryClient.setQueryData(analysisKeys.aiInsights(chatId), insights)

      // Invalidate chat to persist changes
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) })
    },
  })
}
