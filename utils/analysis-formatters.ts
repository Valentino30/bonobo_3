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

  if (rate1 > rate2) {
    return i18n.locale === 'it'
      ? `Questo indica che ${analysis.participant1.name} avvia le conversazioni più spesso di ${analysis.participant2.name}, il che può suggerire un livello di coinvolgimento più elevato.`
      : `This indicates that ${analysis.participant1.name} starts conversations more often than ${analysis.participant2.name}, which may suggest a higher level of interest or eagerness to engage.`
  }

  if (rate2 > rate1) {
    return i18n.locale === 'it'
      ? `Questo indica che ${analysis.participant2.name} avvia le conversazioni più spesso di ${analysis.participant1.name}, il che può suggerire un livello di coinvolgimento più elevato.`
      : `This indicates that ${analysis.participant2.name} starts conversations more often than ${analysis.participant1.name}, which may suggest a higher level of interest or eagerness to engage.`
  }

  return i18n.locale === 'it'
    ? `Entrambi i partecipanti avviano le conversazioni in modo equilibrato, indicando un livello bilanciato di interesse e coinvolgimento da entrambe le parti.`
    : `Both participants initiate conversations equally, indicating a balanced level of interest and engagement from both sides.`
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
    return i18n.locale === 'it'
      ? `${analysis.participant1.name} mostra un punteggio di coinvolgimento più elevato (${level1}%) rispetto a ${analysis.participant2.name} (${level2}%), basato su tempo di risposta, lunghezza dei messaggi e frequenza, suggerendo un livello di interesse maggiore.`
      : `${analysis.participant1.name} shows a higher overall engagement score (${level1}%) compared to ${analysis.participant2.name} (${level2}%), based on response time, message length, and frequency. This suggests ${analysis.participant1.name} may be more invested in the conversation.`
  }

  if (level2 > level1) {
    return i18n.locale === 'it'
      ? `${analysis.participant2.name} mostra un punteggio di coinvolgimento più elevato (${level2}%) rispetto a ${analysis.participant1.name} (${level1}%), basato su tempo di risposta, lunghezza dei messaggi e frequenza, suggerendo un livello di interesse maggiore.`
      : `${analysis.participant2.name} shows a higher overall engagement score (${level2}%) compared to ${analysis.participant1.name} (${level1}%), based on response time, message length, and frequency. This suggests ${analysis.participant2.name} may be more invested in the conversation.`
  }

  return i18n.locale === 'it'
    ? `Entrambi i partecipanti mostrano livelli di coinvolgimento uguali (${level1}%), indicando un investimento equilibrato nella conversazione da entrambe le parti.`
    : `Both participants show equal engagement levels (${level1}%), indicating a balanced investment in the conversation from both sides.`
}
