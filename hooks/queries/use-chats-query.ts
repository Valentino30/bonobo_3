import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AIInsights } from '@/utils/ai-service'
import { type ChatAnalysisData, ChatStorage, type StoredChat } from '@/utils/chat-storage'

// Query keys
export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: () => [...chatKeys.lists()] as const,
  details: () => [...chatKeys.all, 'detail'] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
}

// Query: Get all chats
export function useChatsQuery() {
  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: async () => {
      await ChatStorage.migrateFromLocalStorage()
      return ChatStorage.loadChats()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Query: Get single chat by ID
export function useChatQuery(chatId: string) {
  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: async () => {
      const chats = await ChatStorage.loadChats()
      return chats.find((chat) => chat.id === chatId) || null
    },
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation: Add chat
export function useAddChatMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chat: StoredChat) => {
      await ChatStorage.addChat(chat)
      return chat
    },
    onMutate: async (newChat) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.list() })

      // Snapshot previous value
      const previousChats = queryClient.getQueryData<StoredChat[]>(chatKeys.list())

      // Optimistically update
      queryClient.setQueryData<StoredChat[]>(chatKeys.list(), (old) => [newChat, ...(old || [])])

      return { previousChats }
    },
    onError: (err, newChat, context) => {
      // Rollback on error
      queryClient.setQueryData(chatKeys.list(), context?.previousChats)
    },
    onSuccess: () => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.list() })
    },
  })
}

// Mutation: Delete chat
export function useDeleteChatMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatId: string) => {
      await ChatStorage.deleteChat(chatId)
      return chatId
    },
    onMutate: async (chatId) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.list() })

      const previousChats = queryClient.getQueryData<StoredChat[]>(chatKeys.list())

      queryClient.setQueryData<StoredChat[]>(chatKeys.list(), (old) => old?.filter((c) => c.id !== chatId) || [])

      return { previousChats }
    },
    onError: (err, chatId, context) => {
      queryClient.setQueryData(chatKeys.list(), context?.previousChats)
    },
    onSuccess: (chatId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() })
      queryClient.removeQueries({ queryKey: chatKeys.detail(chatId) })
    },
  })
}

// Mutation: Clear all chats
export function useClearAllChatsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await ChatStorage.clearAllChats()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: chatKeys.list() })

      const previousChats = queryClient.getQueryData<StoredChat[]>(chatKeys.list())

      queryClient.setQueryData<StoredChat[]>(chatKeys.list(), [])

      return { previousChats }
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(chatKeys.list(), context?.previousChats)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all })
    },
  })
}

// Mutation: Update chat analysis
export function useUpdateChatAnalysisMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      chatId,
      analysis,
      aiInsights,
      unlockedInsights,
    }: {
      chatId: string
      analysis: ChatAnalysisData
      aiInsights?: AIInsights
      unlockedInsights?: string[]
    }) => {
      await ChatStorage.updateChatAnalysis(chatId, analysis, aiInsights, unlockedInsights)
      return { chatId, analysis, aiInsights, unlockedInsights }
    },
    onMutate: async ({ chatId, analysis, aiInsights, unlockedInsights }) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.detail(chatId) })
      await queryClient.cancelQueries({ queryKey: chatKeys.list() })

      const previousChat = queryClient.getQueryData<StoredChat>(chatKeys.detail(chatId))
      const previousChats = queryClient.getQueryData<StoredChat[]>(chatKeys.list())

      // Update single chat query
      queryClient.setQueryData<StoredChat | null>(chatKeys.detail(chatId), (old) =>
        old
          ? {
              ...old,
              analysis,
              aiInsights: aiInsights ?? old.aiInsights,
              unlockedInsights: unlockedInsights ?? old.unlockedInsights,
            }
          : null
      )

      // Update chats list query
      queryClient.setQueryData<StoredChat[]>(
        chatKeys.list(),
        (old) =>
          old?.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  analysis,
                  aiInsights: aiInsights ?? chat.aiInsights,
                  unlockedInsights: unlockedInsights ?? chat.unlockedInsights,
                }
              : chat
          ) || []
      )

      return { previousChat, previousChats }
    },
    onError: (err, { chatId }, context) => {
      if (context?.previousChat) {
        queryClient.setQueryData(chatKeys.detail(chatId), context.previousChat)
      }
      if (context?.previousChats) {
        queryClient.setQueryData(chatKeys.list(), context.previousChats)
      }
    },
    onSuccess: ({ chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.list() })
    },
  })
}
