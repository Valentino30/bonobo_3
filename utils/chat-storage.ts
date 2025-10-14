import * as SecureStore from 'expo-secure-store'
import type { AIInsights } from './ai-service'

export interface ChatAnalysisData {
  totalMessages: number
  participant1: {
    name: string
    messageCount: number
    averageResponseTime: number
    interestLevel: number
  }
  participant2: {
    name: string
    messageCount: number
    averageResponseTime: number
    interestLevel: number
  }
  dateRange: { start: Date; end: Date }
  conversationHealth: {
    balanceScore: number
    engagementScore: number
  }
}

export interface StoredChat {
  id: string
  text: string
  timestamp: Date
  participants?: string[]
  messageCount?: number
  analysis?: ChatAnalysisData // Cached analysis results
  aiInsights?: AIInsights // Cached AI insights
  unlockedInsights?: string[] // List of unlocked insight IDs
}

const CHATS_STORAGE_KEY = 'bonobo_chats'

export class ChatStorage {
  static async loadChats(): Promise<StoredChat[]> {
    try {
      const chatsJson = await SecureStore.getItemAsync(CHATS_STORAGE_KEY)
      if (chatsJson) {
        const chats = JSON.parse(chatsJson)
        // Convert timestamp strings back to Date objects
        return chats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
        }))
      }
      return []
    } catch (error) {
      console.error('Error loading chats from storage:', error)
      return []
    }
  }

  static async saveChats(chats: StoredChat[]): Promise<void> {
    try {
      const chatsJson = JSON.stringify(chats)
      await SecureStore.setItemAsync(CHATS_STORAGE_KEY, chatsJson)
      console.log('Chats saved to storage successfully')
    } catch (error) {
      console.error('Error saving chats to storage:', error)
    }
  }

  static async addChat(chat: StoredChat): Promise<void> {
    try {
      const existingChats = await this.loadChats()
      const updatedChats = [chat, ...existingChats]
      await this.saveChats(updatedChats)
    } catch (error) {
      console.error('Error adding chat to storage:', error)
    }
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const existingChats = await this.loadChats()
      const updatedChats = existingChats.filter((chat) => chat.id !== chatId)
      await this.saveChats(updatedChats)
      console.log('Chat deleted from storage successfully')
    } catch (error) {
      console.error('Error deleting chat from storage:', error)
    }
  }

  static async clearAllChats(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CHATS_STORAGE_KEY)
      console.log('All chats cleared from storage')
    } catch (error) {
      console.error('Error clearing chats from storage:', error)
    }
  }

  static async getChatCount(): Promise<number> {
    try {
      const chats = await this.loadChats()
      return chats.length
    } catch (error) {
      console.error('Error getting chat count:', error)
      return 0
    }
  }

  static async updateChatAnalysis(chatId: string, analysis: ChatAnalysisData, aiInsights?: AIInsights, unlockedInsights?: string[]): Promise<void> {
    try {
      const existingChats = await this.loadChats()
      const updatedChats = existingChats.map((chat) => 
        chat.id === chatId 
          ? { ...chat, analysis, aiInsights, unlockedInsights: unlockedInsights ?? chat.unlockedInsights } 
          : chat
      )
      await this.saveChats(updatedChats)
      console.log('Chat analysis and AI insights saved to storage successfully')
    } catch (error) {
      console.error('Error updating chat analysis:', error)
    }
  }
}
