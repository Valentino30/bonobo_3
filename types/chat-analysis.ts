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

export interface AIInsights {
  redFlags: {
    count: number
    description: string
    items: string[]
  }
  greenFlags: {
    count: number
    description: string
    items: string[]
  }
  attachmentStyle: {
    type: string
    description: string
    items: string[]
  }
  reciprocityScore: {
    percentage: number
    rating: string
    description: string
    items: string[]
  }
  compliments: {
    count: number
    description: string
    items: string[]
  }
  criticism: {
    count: number
    description: string
    items: string[]
  }
  compatibilityScore: {
    percentage: number
    rating: string
    description: string
    items: string[]
  }
  relationshipTips: {
    count: number
    description: string
    tips: string[]
  }
  conflictResolution: {
    type: string
    description: string
    items: string[]
  }
  sharedInterests: {
    count: number
    description: string
    items: string[]
  }
  weVsIRatio: {
    percentage: number
    rating: string
    description: string
    items: string[]
  }
  loveLanguage: {
    primary: string
    secondary: string
    description: string
    items: string[]
  }
}
