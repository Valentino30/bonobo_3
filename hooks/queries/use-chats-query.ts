import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChatStorage, type StoredChat } from '@/services/chat-storage'

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
    queryFn: () => ChatStorage.loadChats(),
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
    onError: (_err, _newChat, context) => {
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
    onError: (_err, _chatId, context) => {
      queryClient.setQueryData(chatKeys.list(), context?.previousChats)
    },
    onSuccess: (chatId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() })
      queryClient.removeQueries({ queryKey: chatKeys.detail(chatId) })
    },
  })
}
