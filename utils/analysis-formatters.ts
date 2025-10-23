import { type ChatAnalysisData } from '@/hooks/use-chat-analysis'
import i18n from '@/i18n/config'

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

  if (rate1 !== rate2) {
    const higherName = rate1 > rate2 ? analysis.participant1.name : analysis.participant2.name
    const lowerName = rate1 > rate2 ? analysis.participant2.name : analysis.participant1.name

    return i18n.t('analysis.overview.initiationDescription.higher', {
      name1: higherName,
      name2: lowerName,
    })
  }

  return i18n.t('analysis.overview.initiationDescription.equal')
}

/**
 * Generate description comparing interest levels between participants
 * @param analysis - Chat analysis data
 * @returns Description of relative engagement levels
 */
export function getInterestDescription(analysis: ChatAnalysisData): string {
  const level1 = analysis.participant1.interestLevel
  const level2 = analysis.participant2.interestLevel

  if (level1 !== level2) {
    const higherName = level1 > level2 ? analysis.participant1.name : analysis.participant2.name
    const lowerName = level1 > level2 ? analysis.participant2.name : analysis.participant1.name
    const higherLevel = level1 > level2 ? level1 : level2
    const lowerLevel = level1 > level2 ? level2 : level1

    return i18n.t('analysis.overview.interestDescription.higher', {
      name1: higherName,
      name2: lowerName,
      level1: higherLevel,
      level2: lowerLevel,
    })
  }

  return i18n.t('analysis.overview.interestDescription.equal', { level: level1 })
}
