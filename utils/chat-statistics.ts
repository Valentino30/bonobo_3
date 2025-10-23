import type { ChatAnalysisData, MessageData, ParticipantStats } from '@/types/chat-analysis'
import { countWords } from './string-helpers'
import { parseWhatsAppMessages } from './whatsapp-parser'

/**
 * Main entry point for calculating chat statistics from WhatsApp export text
 * This generates all the data displayed in the Analysis Overview screen:
 * - Total messages count (💬 card)
 * - Per-participant message counts (👥 card)
 * - Average response times (⏱️ card)
 * - Average message lengths (📝 card)
 * - Conversation initiation rates (🚀 card)
 * - Interest levels (❤️ card)
 * - Conversation health scores (balance & engagement)
 */
export function calculateChatStatistics(chatText: string): ChatAnalysisData {
  const messages = parseWhatsAppMessages(chatText)
  const messagesWithResponseTimes = enrichMessagesWithResponseTimes(messages)
  const analysis = buildOverviewStatistics(messagesWithResponseTimes)
  return analysis
}

/**
 * Enriches messages with response time data
 * Used for "Average Response Time" (⏱️) card in Overview screen
 * Calculates time elapsed between when someone receives a message and when they reply
 */
function enrichMessagesWithResponseTimes(messages: MessageData[]): MessageData[] {
  const enhancedMessages = [...messages]

  for (let i = 1; i < enhancedMessages.length; i++) {
    const currentMessage = enhancedMessages[i]
    const previousMessage = enhancedMessages[i - 1]

    if (currentMessage.sender !== previousMessage.sender) {
      const timeDiff = currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime()
      currentMessage.responseTime = timeDiff
    }
  }

  return enhancedMessages
}

/**
 * Builds the complete statistical analysis from parsed messages
 * Aggregates all metrics displayed in the Overview screen
 * Returns ChatAnalysisData with both per-participant stats and conversation health scores
 */
function buildOverviewStatistics(messages: MessageData[]): ChatAnalysisData {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      participant1: {
        name: 'Unknown',
        messageCount: 0,
        averageResponseTime: 0,
        interestLevel: 0,
        initiationRate: 0,
        averageMessageLength: 0,
      },
      participant2: {
        name: 'Unknown',
        messageCount: 0,
        averageResponseTime: 0,
        interestLevel: 0,
        initiationRate: 0,
        averageMessageLength: 0,
      },
      dateRange: { start: new Date(), end: new Date() },
      conversationHealth: { balanceScore: 0, engagementScore: 0 },
    }
  }

  const participants = Array.from(new Set(messages.map((m) => m.sender)))
  const participant1Name = participants[0] || 'Participant 1'
  const participant2Name = participants[1] || 'Participant 2'

  const participant1Stats = calculateIndividualParticipantMetrics(participant1Name, messages)
  const participant2Stats = calculateIndividualParticipantMetrics(participant2Name, messages)

  const balanceScore = calculateBalanceScore(participant1Stats.messageCount, participant2Stats.messageCount)
  const engagementScore = calculateEngagementScore(participant1Stats, participant2Stats)

  const timestamps = messages.map((m) => m.timestamp).sort()
  const dateRange = { start: timestamps[0], end: timestamps[timestamps.length - 1] }

  return {
    totalMessages: messages.length,
    participant1: participant1Stats,
    participant2: participant2Stats,
    dateRange,
    conversationHealth: {
      balanceScore,
      engagementScore,
    },
  }
}

/**
 * Calculates all metrics for a single participant
 * Generates data for multiple Overview cards:
 * - Message count (👥 Messages per Participant card)
 * - Average response time (⏱️ Average Response Time card)
 * - Average message length (📝 Average Message Length card)
 * - Initiation rate (🚀 Initiation Rate card - % of conversations started)
 * - Interest level (❤️ Interest Level card - composite score based on response time, message length, frequency)
 */
function calculateIndividualParticipantMetrics(participantName: string, messages: MessageData[]): ParticipantStats {
  const participantMessages = messages.filter((m) => m.sender === participantName)
  const messageCount = participantMessages.length

  const responseTimes = participantMessages.filter((m) => m.responseTime !== undefined).map((m) => m.responseTime!)

  // Convert response times from milliseconds to hours for ⏱️ card display
  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60 * 60)
      : 0

  // Interest level shown in ❤️ card (composite score)
  const interestLevel = calculateInterestLevelScore(participantMessages, averageResponseTime)

  // Percentage shown in 🚀 Initiation Rate card
  const initiationRate = calculateConversationInitiationRate(participantName, messages)

  // Word count shown in 📝 Average Message Length card
  const averageMessageLength =
    messageCount > 0
      ? Math.round(participantMessages.reduce((sum, m) => sum + countWords(m.content), 0) / messageCount)
      : 0

  return {
    name: participantName,
    messageCount,
    averageResponseTime,
    interestLevel,
    initiationRate,
    averageMessageLength,
  }
}

/**
 * Calculates interest level score (0-100) for ❤️ Interest Level card
 * Composite score based on:
 * - Response time (faster = higher score, max 40 points)
 * - Message length (longer messages = higher score, max 30 points)
 * - Message frequency (more messages = higher score, max 30 points)
 */
function calculateInterestLevelScore(messages: MessageData[], averageResponseTime: number): number {
  if (messages.length === 0) return 0

  const responseTimeScore = Math.max(0, 40 - averageResponseTime * 2)
  // Calculate average word count per message
  const averageWordCount = messages.reduce((sum, m) => sum + countWords(m.content), 0) / messages.length
  // Adjust scoring: typical messages are 5-15 words, so score up to 30 points for 15+ words
  const lengthScore = Math.min(30, averageWordCount * 2)
  const frequencyScore = Math.min(30, messages.length / 10)

  return Math.round(Math.min(100, responseTimeScore + lengthScore + frequencyScore))
}

/**
 * Calculates how balanced the conversation is (0-100)
 * Used internally for conversationHealth.balanceScore
 * Higher score = more balanced (both participants send similar number of messages)
 * 100 = perfectly balanced, lower scores indicate imbalance
 */
function calculateBalanceScore(count1: number, count2: number): number {
  if (count1 === 0 && count2 === 0) return 0
  const ratio = Math.min(count1, count2) / Math.max(count1, count2)
  return Math.round(ratio * 100)
}

/**
 * Calculates overall conversation engagement score
 * Used internally for conversationHealth.engagementScore
 * Average of both participants' interest levels
 */
function calculateEngagementScore(participant1: ParticipantStats, participant2: ParticipantStats): number {
  return Math.round((participant1.interestLevel + participant2.interestLevel) / 2)
}

/**
 * Calculates what percentage of conversations this participant initiates
 * Displayed in 🚀 Initiation Rate card
 * A "new conversation" is defined as a message sent after 6+ hours of silence
 */
function calculateConversationInitiationRate(participantName: string, messages: MessageData[]): number {
  if (messages.length === 0) return 0

  // A conversation is "initiated" when someone sends a message after a gap of more than 6 hours
  const initiationThreshold = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
  let initiationsByParticipant = 0
  let totalInitiations = 0

  // First message is always an initiation
  if (messages[0]?.sender === participantName) {
    initiationsByParticipant++
  }
  totalInitiations++

  // Check each message to see if it initiates a new conversation
  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i]
    const previousMessage = messages[i - 1]
    const timeSinceLast = currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime()

    // If more than 6 hours passed, this is a new conversation initiation
    if (timeSinceLast > initiationThreshold) {
      totalInitiations++
      if (currentMessage.sender === participantName) {
        initiationsByParticipant++
      }
    }
  }

  return totalInitiations > 0 ? Math.round((initiationsByParticipant / totalInitiations) * 100) : 0
}
