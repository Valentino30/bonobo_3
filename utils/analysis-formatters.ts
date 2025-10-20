import { type ChatAnalysisData } from '@/hooks/use-chat-analysis'

/**
 * Format response time from hours to human-readable string
 * @param hours - Response time in hours
 * @returns Formatted string (e.g., "45m" or "2.3h")
 */
export function formatResponseTime(hours: number): string {
  return hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`
}

/**
 * Generate description comparing initiation rates between participants
 * @param analysis - Chat analysis data
 * @returns Description of who initiates more often
 */
export function getInitiationDescription(analysis: ChatAnalysisData): string {
  const rate1 = analysis.participant1.initiationRate ?? 0
  const rate2 = analysis.participant2.initiationRate ?? 0

  if (rate1 > rate2) {
    return `This indicates that ${analysis.participant1.name} starts conversations more often than ${analysis.participant2.name}, which may suggest a higher level of interest or eagerness to engage.`
  }

  if (rate2 > rate1) {
    return `This indicates that ${analysis.participant2.name} starts conversations more often than ${analysis.participant1.name}, which may suggest a higher level of interest or eagerness to engage.`
  }

  return `Both participants initiate conversations equally, indicating a balanced level of interest and engagement from both sides.`
}

/**
 * Generate description comparing interest levels between participants
 * @param analysis - Chat analysis data
 * @returns Description of relative engagement levels
 */
export function getInterestDescription(analysis: ChatAnalysisData): string {
  const level1 = analysis.participant1.interestLevel
  const level2 = analysis.participant2.interestLevel

  if (level1 > level2) {
    return `${analysis.participant1.name} shows a higher overall engagement score (${level1}%) compared to ${analysis.participant2.name} (${level2}%), based on response time, message length, and frequency. This suggests ${analysis.participant1.name} may be more invested in the conversation.`
  }

  if (level2 > level1) {
    return `${analysis.participant2.name} shows a higher overall engagement score (${level2}%) compared to ${analysis.participant1.name} (${level1}%), based on response time, message length, and frequency. This suggests ${analysis.participant2.name} may be more invested in the conversation.`
  }

  return `Both participants show equal engagement levels (${level1}%), indicating a balanced investment in the conversation from both sides.`
}
