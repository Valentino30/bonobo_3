/**
 * Shared types for chat analysis functionality
 */

export interface ParticipantStats {
  name: string
  messageCount: number
  averageResponseTime: number
  interestLevel: number
  initiationRate?: number
  averageMessageLength?: number
}

export interface ChatAnalysisData {
  totalMessages: number
  participant1: ParticipantStats
  participant2: ParticipantStats
  dateRange: { start: Date; end: Date }
  conversationHealth: {
    balanceScore: number
    engagementScore: number
  }
}

export interface MessageData {
  timestamp: Date
  sender: string
  content: string
  type: 'text' | 'media' | 'deleted'
  responseTime?: number
}
