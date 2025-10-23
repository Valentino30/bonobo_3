import { useChatsQuery, useDeleteChatMutation } from '@/hooks/queries/use-chats-query'

/**
 * Hook that manages data and business logic for chats screen
 * Handles data fetching and chat operations
 */
export function useChats() {
  // React Query hooks for data management
  const { data: chats = [], isLoading } = useChatsQuery()
  const deleteChatMutation = useDeleteChatMutation()

  // Chat operations
  const deleteChat = async (chatId: string) => {
    await deleteChatMutation.mutateAsync(chatId)
  }

  return {
    chats,
    isLoading,
    deleteChat,
  }
}
