import type { AIInsights } from './ai-service'
import type { ChatAnalysisData } from '@/types/chat-analysis'
import { getDeviceId } from '@/utils/device-id'
import { supabase } from './supabase'

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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log('📂 Loading chats:', {
        isAuthenticated: !!user,
        userId: user?.id,
        deviceId,
      })

      let query = supabase.from('chats').select('*')

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
      return (data || []).map((row) => ({
        id: row.id as string,
        text: row.chat_text as string,
        timestamp: new Date(row.timestamp as string),
        participants: (row.participants as string[]) || [],
        messageCount: row.message_count as number | undefined,
        analysis: row.analysis as ChatAnalysisData | undefined,
        aiInsights: row.ai_insights as AIInsights | undefined,
        unlockedInsights: (row.unlocked_insights as string[]) || [],
      }))
    } catch (error) {
      console.error('Error loading chats from Supabase:', error)
      return []
    }
  }


  static async addChat(chat: StoredChat): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const insertData: {
        id: string
        chat_text: string
        timestamp: string
        participants: string[]
        message_count: number | undefined
        analysis: ChatAnalysisData | null
        ai_insights: AIInsights | null
        unlocked_insights: string[]
        user_id?: string | null
        device_id?: string | null
      } = {
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
      } else {
        insertData.device_id = deviceId
        insertData.user_id = null
      }

      const { error } = await supabase.from('chats').insert(insertData)

      if (error) {
        console.error('Error adding chat to Supabase:', error)
        throw error
      }

      console.log('Chat added to Supabase successfully')
    } catch (error) {
      console.error('Error adding chat to Supabase:', error)
      throw error
    }
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let query = supabase.from('chats').delete().eq('id', chatId)

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

  static async getChatCount(): Promise<number> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let query = supabase.from('chats').select('*', { count: 'exact', head: true })

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

  static async updateChatAnalysis(
    chatId: string,
    analysis: ChatAnalysisData,
    aiInsights?: AIInsights,
    unlockedInsights?: string[]
  ): Promise<void> {
    try {
      const deviceId = await getDeviceId()

      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const updateData: {
        analysis: ChatAnalysisData
        updated_at: string
        ai_insights?: AIInsights
        unlocked_insights?: string[]
      } = {
        analysis,
        updated_at: new Date().toISOString(),
      }

      if (aiInsights !== undefined) {
        updateData.ai_insights = aiInsights
      }

      if (unlockedInsights !== undefined) {
        updateData.unlocked_insights = unlockedInsights
      }

      let query = supabase.from('chats').update(updateData).eq('id', chatId)

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

}
