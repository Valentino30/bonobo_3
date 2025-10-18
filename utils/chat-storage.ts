import type { AIInsights } from './ai-service'
import { getDeviceId } from './device-id'
import { supabase } from './supabase'

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

export class ChatStorage {
  static async loadChats(): Promise<StoredChat[]> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      console.log('📂 Loading chats:', {
        isAuthenticated: !!user,
        userId: user?.id,
        deviceId,
      })

      let query = supabase
        .from('chats')
        .select('*')

      // If user is authenticated, ONLY fetch chats linked to user_id
      // This prevents showing chats after logout (migrated chats have device_id = NULL)
      // When user logs out, only device_id chats are shown
      if (user) {
        console.log('🔐 User authenticated - loading chats for user_id:', user.id)
        query = query.eq('user_id', user.id)
      } else {
        console.log('👤 Anonymous user - loading chats for device_id:', deviceId)
        query = query.eq('device_id', deviceId)
      }

      const { data, error } = await query.order('timestamp', { ascending: false })

      if (error) {
        console.error('Error loading chats from Supabase:', error)
        return []
      }

      console.log(`✅ Loaded ${data?.length || 0} chats from Supabase`)

      // Convert database format to StoredChat format
      return (data || []).map((row: any) => ({
        id: row.id,
        text: row.chat_text,
        timestamp: new Date(row.timestamp),
        participants: row.participants || [],
        messageCount: row.message_count,
        analysis: row.analysis,
        aiInsights: row.ai_insights,
        unlockedInsights: row.unlocked_insights || [],
      }))
    } catch (error) {
      console.error('Error loading chats from Supabase:', error)
      return []
    }
  }

  static async saveChats(chats: StoredChat[]): Promise<void> {
    // This method is kept for backward compatibility but not used with Supabase
    // Individual operations (addChat, updateChat, etc.) are used instead
    console.warn('saveChats is deprecated with Supabase - use individual operations')
  }

  static async addChat(chat: StoredChat): Promise<void> {
    try {
      console.log('📥 ChatStorage.addChat called for chat:', chat.id)
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      const insertData: any = {
        id: chat.id,
        chat_text: chat.text,
        timestamp: chat.timestamp.toISOString(),
        participants: chat.participants || [],
        message_count: chat.messageCount,
        analysis: chat.analysis || null,
        ai_insights: chat.aiInsights || null,
        unlocked_insights: chat.unlockedInsights || [],
      }

      // If user is authenticated, link chat to user_id only (device_id = NULL)
      // Otherwise, link to device_id only (user_id = NULL)
      if (user) {
        insertData.user_id = user.id
        insertData.device_id = null
        console.log('🔐 Authenticated user - setting user_id, device_id = NULL')
      } else {
        insertData.device_id = deviceId
        insertData.user_id = null
        console.log('👤 Anonymous user - setting device_id, user_id = NULL')
      }

      console.log('💾 Inserting chat into Supabase:', { chatId: chat.id, deviceId, userId: user?.id })
      const { error } = await supabase
        .from('chats')
        .insert(insertData)

      if (error) {
        console.error('❌ Error adding chat to Supabase:', error)
        throw error
      }

      console.log('✅ Chat added to Supabase successfully:', chat.id)
    } catch (error) {
      console.error('❌ Error adding chat to Supabase:', error)
      throw error
    }
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('chats')
        .delete()
        .eq('id', chatId)

      // If user is authenticated, ONLY delete chats linked to user_id
      // Otherwise, only delete chats matching device_id
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { error } = await query

      if (error) {
        console.error('Error deleting chat from Supabase:', error)
        throw error
      }

      console.log('Chat deleted from Supabase successfully')
    } catch (error) {
      console.error('Error deleting chat from Supabase:', error)
      throw error
    }
  }

  static async clearAllChats(): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('chats')
        .delete()

      // If user is authenticated, ONLY delete chats linked to user_id
      // Otherwise, only delete chats matching device_id
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { error } = await query

      if (error) {
        console.error('Error clearing chats from Supabase:', error)
        throw error
      }

      console.log('All chats cleared from Supabase')
    } catch (error) {
      console.error('Error clearing chats from Supabase:', error)
      throw error
    }
  }

  static async getChatCount(): Promise<number> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })

      // If user is authenticated, ONLY count chats linked to user_id
      // Otherwise, only count chats matching device_id
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { count, error } = await query

      if (error) {
        console.error('Error getting chat count from Supabase:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error getting chat count:', error)
      return 0
    }
  }

  static async updateChatAnalysis(chatId: string, analysis: ChatAnalysisData, aiInsights?: AIInsights, unlockedInsights?: string[]): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      const updateData: any = {
        analysis,
        updated_at: new Date().toISOString(),
      }

      if (aiInsights !== undefined) {
        updateData.ai_insights = aiInsights
      }

      if (unlockedInsights !== undefined) {
        updateData.unlocked_insights = unlockedInsights
      }

      let query = supabase
        .from('chats')
        .update(updateData)
        .eq('id', chatId)

      // If user is authenticated, ONLY update chats linked to user_id
      // Otherwise, only update chats matching device_id
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('device_id', deviceId)
      }

      const { error } = await query

      if (error) {
        console.error('Error updating chat analysis in Supabase:', error)
        throw error
      }

      console.log('Chat analysis and AI insights saved to Supabase successfully')
    } catch (error) {
      console.error('Error updating chat analysis:', error)
      throw error
    }
  }

  // Migration utility: Clear old SecureStore data
  static async clearOldLocalStorage(): Promise<void> {
    try {
      const SecureStore = await import('expo-secure-store')
      await SecureStore.deleteItemAsync('bonobo_chats')
      console.log('Old local storage cleared')
    } catch (error) {
      console.error('Error clearing old local storage:', error)
    }
  }

  // Migration utility: Load from old SecureStore format
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      const SecureStore = await import('expo-secure-store')
      const chatsJson = await SecureStore.getItemAsync('bonobo_chats')
      
      if (!chatsJson) {
        console.log('No local storage data to migrate')
        return
      }

      const oldChats = JSON.parse(chatsJson)
      console.log(`Found ${oldChats.length} chats in local storage, migrating...`)

      for (const chat of oldChats) {
        try {
          await this.addChat({
            ...chat,
            timestamp: new Date(chat.timestamp),
          })
          console.log(`Migrated chat ${chat.id}`)
        } catch (error) {
          console.error(`Error migrating chat ${chat.id}:`, error)
        }
      }

      // Clear old storage after successful migration
      await this.clearOldLocalStorage()
      console.log('Migration complete!')
    } catch (error) {
      console.error('Error during migration:', error)
    }
  }
}

