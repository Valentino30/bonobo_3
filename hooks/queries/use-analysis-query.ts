import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type AIInsights, analyzeChat } from '@/services/analysis-service'
import { calculateOverviewStats } from '@/utils/chat-statistics'
import { updateChatAnalysis, type StoredChat } from '@/services/chat-service'
import { hasAccess, hasActiveSubscription, assignAnalysisToChat } from '@/services/entitlement-service'
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

      // Calculate basic stats
      const overviewStats = calculateOverviewStats(chatText)
      return overviewStats
    },
    enabled: enabled && !!chatId && !!chatText,
    staleTime: Infinity, // Analysis never goes stale once computed
  })
}

// Mutation parameters type
export type UnlockInsightParams = {
  chatId: string
  insightId: string
  chatText: string
  analysis: any
}

// Mutation: Unlock insight
export function useUnlockInsightMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ chatId, insightId, chatText, analysis }: UnlockInsightParams) => {
      // Check access
      const userHasAccess = await hasAccess(chatId)

      if (!userHasAccess) {
        throw new Error('NO_ACCESS')
      }

      // Get or generate AI insights
      let insights = queryClient.getQueryData<AIInsights>(analysisKeys.aiInsights(chatId))

      if (!insights) {
        const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
        insights = chat?.aiInsights || (await analyzeChat(chatText))

        // Assign one-time purchase to chat if needed
        const hasSubscription = await hasActiveSubscription()

        if (!hasSubscription) {
          await assignAnalysisToChat(chatId)
        }
      }

      return { chatId, insightId, insights, analysis }
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
    onSuccess: async ({ chatId, insightId, insights, analysis }) => {
      // Update AI insights cache
      queryClient.setQueryData(analysisKeys.aiInsights(chatId), insights)

      // Get current chat data from cache
      const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))

      if (chat && analysis) {
        // Persist to Supabase with updated unlocked insights and AI insights
        // Don't add insightId again if it's already in the array from optimistic update
        const updatedUnlockedInsights = chat.unlockedInsights?.includes(insightId)
          ? chat.unlockedInsights
          : [...(chat.unlockedInsights || []), insightId]

        await updateChatAnalysis(chatId, analysis, insights, updatedUnlockedInsights)

        // Update cache with persisted data (no refetch needed)
        queryClient.setQueryData<StoredChat>(chatKeys.detail(chatId), {
          ...chat,
          analysis,
          aiInsights: insights,
          unlockedInsights: updatedUnlockedInsights,
        })
      }
    },
  })
}
