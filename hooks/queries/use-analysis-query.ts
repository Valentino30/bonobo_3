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
      console.log('🔐 Starting unlock mutation:', { chatId, insightId })

      // Check access
      const hasAccess = await PaymentService.hasAccess(chatId)
      console.log('🔑 Access check result:', hasAccess)

      if (!hasAccess) {
        console.log('❌ No access, throwing NO_ACCESS error')
        throw new Error('NO_ACCESS')
      }

      // Get or generate AI insights
      let insights = queryClient.getQueryData<AIInsights>(analysisKeys.aiInsights(chatId))
      console.log('💡 AI insights from cache:', !!insights)

      if (!insights) {
        const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
        insights = chat?.aiInsights || (await analyzeChat(chatText))
        console.log('💡 Generated/retrieved AI insights:', !!insights)

        // Assign one-time purchase to chat if needed
        const hasSubscription = await PaymentService.hasActiveSubscription()
        console.log('💳 Has subscription:', hasSubscription)

        if (!hasSubscription) {
          console.log('💰 Assigning one-time purchase to chat')
          await PaymentService.assignAnalysisToChat(chatId)
        }
      }

      console.log('✅ Mutation function completed successfully')
      return { chatId, insightId, insights, analysis }
    },
    onMutate: async ({ chatId, insightId }) => {
      console.log('🎯 onMutate: Optimistically updating cache', { chatId, insightId })

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.detail(chatId) })

      const previousChat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
      console.log('📸 Previous chat state:', {
        chatId,
        unlockedInsights: previousChat?.unlockedInsights,
      })

      // Optimistically update unlocked insights
      queryClient.setQueryData<StoredChat | null>(chatKeys.detail(chatId), (old) =>
        old
          ? {
              ...old,
              unlockedInsights: [...(old.unlockedInsights || []), insightId],
            }
          : null
      )

      const updatedChat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
      console.log('✨ Optimistic update applied:', {
        chatId,
        unlockedInsights: updatedChat?.unlockedInsights,
      })

      return { previousChat }
    },
    onError: (err, { chatId }, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(chatKeys.detail(chatId), context.previousChat)
      }
    },
    onSuccess: async ({ chatId, insightId, insights, analysis }) => {
      console.log('🔓 Unlock insight mutation succeeded:', { chatId, insightId, hasAnalysis: !!analysis })

      // Update AI insights cache
      queryClient.setQueryData(analysisKeys.aiInsights(chatId), insights)

      // Get current chat data from cache
      const chat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))

      console.log('📦 Current chat cache:', {
        chatId,
        unlockedInsights: chat?.unlockedInsights,
        hasAnalysis: !!analysis,
      })

      if (chat && analysis) {
        // Persist to Supabase with updated unlocked insights and AI insights
        const { ChatStorage } = await import('@/utils/chat-storage')
        // Don't add insightId again if it's already in the array from optimistic update
        const updatedUnlockedInsights = chat.unlockedInsights?.includes(insightId)
          ? chat.unlockedInsights
          : [...(chat.unlockedInsights || []), insightId]

        console.log('💾 Persisting to Supabase:', { chatId, updatedUnlockedInsights })

        await ChatStorage.updateChatAnalysis(chatId, analysis, insights, updatedUnlockedInsights)

        console.log('✅ Persisted successfully, updating cache')

        // Update cache with persisted data (no refetch needed)
        queryClient.setQueryData<StoredChat>(chatKeys.detail(chatId), {
          ...chat,
          analysis,
          aiInsights: insights,
          unlockedInsights: updatedUnlockedInsights,
        })

        console.log('✅ Cache updated with persisted data')
      } else {
        console.log('⚠️ Skipping persistence - missing chat or analysis:', {
          hasChat: !!chat,
          hasAnalysis: !!analysis,
        })
      }
    },
  })
}
