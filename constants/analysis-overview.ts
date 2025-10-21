import { type ChatAnalysisData } from '@/hooks/use-chat-analysis'
import { formatResponseTime, getInitiationDescription, getInterestDescription } from '@/utils/analysis-formatters'

type ThemeColors = {
  info: string
  error: string
}

export type OverviewCardConfig = {
  id: string
  type: 'simple' | 'comparison'
  title: string
  icon: string
  description?: (analysis: ChatAnalysisData) => string
  /** Only for simple cards */
  getValue?: (analysis: ChatAnalysisData) => number | string
  /** Only for comparison cards */
  getParticipants?: (
    analysis: ChatAnalysisData,
    colors: ThemeColors
  ) => {
    name: string
    value: number | string
    progressValue?: number
    progressColor?: string
  }[]
  /** Optional condition to show the card */
  shouldShow?: (analysis: ChatAnalysisData) => boolean
}

/**
 * Configuration for all overview analysis cards
 * Defines the data to display and how to format it
 */
export const OVERVIEW_CARDS: OverviewCardConfig[] = [
  {
    id: 'totalMessages',
    type: 'simple',
    title: 'Total Messages',
    icon: '💬',
    getValue: (analysis) => analysis.totalMessages,
  },
  {
    id: 'messagesPerParticipant',
    type: 'comparison',
    title: 'Messages per Participant',
    icon: '👥',
    getParticipants: (analysis) => [
      {
        name: analysis.participant1.name,
        value: analysis.participant1.messageCount,
      },
      {
        name: analysis.participant2.name,
        value: analysis.participant2.messageCount,
      },
    ],
  },
  {
    id: 'responseTime',
    type: 'comparison',
    title: 'Average Response Time',
    icon: '⏱️',
    getParticipants: (analysis) => [
      {
        name: analysis.participant1.name,
        value: formatResponseTime(analysis.participant1.averageResponseTime),
      },
      {
        name: analysis.participant2.name,
        value: formatResponseTime(analysis.participant2.averageResponseTime),
      },
    ],
  },
  {
    id: 'messageLength',
    type: 'comparison',
    title: 'Average Message Length',
    icon: '📝',
    getParticipants: (analysis) => [
      {
        name: analysis.participant1.name,
        value: `${analysis.participant1.averageMessageLength} words`,
      },
      {
        name: analysis.participant2.name,
        value: `${analysis.participant2.averageMessageLength} words`,
      },
    ],
  },
  {
    id: 'initiationRate',
    type: 'comparison',
    title: 'Initiation Rate',
    icon: '🚀',
    description: getInitiationDescription,
    getParticipants: (analysis, colors) => [
      {
        name: analysis.participant1.name,
        value: `${analysis.participant1.initiationRate}%`,
        progressValue: analysis.participant1.initiationRate,
        progressColor: colors.info,
      },
      {
        name: analysis.participant2.name,
        value: `${analysis.participant2.initiationRate ?? 0}%`,
        progressValue: analysis.participant2.initiationRate ?? 0,
        progressColor: colors.error,
      },
    ],
    shouldShow: (analysis) => analysis.participant1.initiationRate !== undefined,
  },
  {
    id: 'interestLevel',
    type: 'comparison',
    title: 'Interest Level',
    icon: '❤️',
    description: getInterestDescription,
    getParticipants: (analysis, colors) => [
      {
        name: analysis.participant1.name,
        value: `${analysis.participant1.interestLevel}%`,
        progressValue: analysis.participant1.interestLevel,
        progressColor: colors.info,
      },
      {
        name: analysis.participant2.name,
        value: `${analysis.participant2.interestLevel}%`,
        progressValue: analysis.participant2.interestLevel,
        progressColor: colors.error,
      },
    ],
  },
]
