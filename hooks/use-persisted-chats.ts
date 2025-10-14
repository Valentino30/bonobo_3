import type { AIInsights } from '@/utils/ai-service'
import { ChatStorage, type ChatAnalysisData, type StoredChat } from '@/utils/chat-storage'
import { useEffect, useState } from 'react'

export function usePersistedChats() {
  const [chats, setChats] = useState<StoredChat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load chats from storage on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        // Try to migrate old local storage data first
        await ChatStorage.migrateFromLocalStorage()
        
        // Load from Supabase
        const storedChats = await ChatStorage.loadChats()
        setChats(storedChats)
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()
  }, [])

  const addChat = async (chat: StoredChat) => {
    try {
      // Add to local state immediately for instant UI update
      setChats((prev) => [chat, ...prev])

      // Persist to storage
      await ChatStorage.addChat(chat)
    } catch (error) {
      console.error('Error adding chat:', error)
      // Revert local state if storage failed
      setChats((prev) => prev.filter((c) => c.id !== chat.id))
    }
  }

  const deleteChat = async (chatId: string) => {
    // Store the chat to delete for potential rollback
    const chatToDelete = chats.find((c) => c.id === chatId)

    try {
      // Remove from local state immediately
      setChats((prev) => prev.filter((c) => c.id !== chatId))

      // Persist to storage
      await ChatStorage.deleteChat(chatId)
    } catch (error) {
      console.error('Error deleting chat:', error)
      // Revert local state if storage failed
      if (chatToDelete) {
        setChats((prev) => [chatToDelete, ...prev])
      }
    }
  }

  const clearAllChats = async () => {
    // Store backup for potential rollback
    const backupChats = [...chats]

    try {
      // Clear local state immediately
      setChats([])

      // Persist to storage
      await ChatStorage.clearAllChats()
    } catch (error) {
      console.error('Error clearing chats:', error)
      // Revert local state if storage failed
      setChats(backupChats)
    }
  }

  const refreshChats = async () => {
    try {
      setIsLoading(true)
      const storedChats = await ChatStorage.loadChats()
      setChats(storedChats)
    } catch (error) {
      console.error('Error refreshing chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateChatAnalysis = async (chatId: string, analysis: ChatAnalysisData, aiInsights?: AIInsights, unlockedInsights?: string[]) => {
    try {
      // Update local state immediately
      setChats((prev) => prev.map((chat) => 
        chat.id === chatId 
          ? { ...chat, analysis, aiInsights, unlockedInsights: unlockedInsights ?? chat.unlockedInsights } 
          : chat
      ))

      // Persist to storage
      await ChatStorage.updateChatAnalysis(chatId, analysis, aiInsights, unlockedInsights)
    } catch (error) {
      console.error('Error updating chat analysis:', error)
    }
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
