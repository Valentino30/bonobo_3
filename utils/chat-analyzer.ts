interface MessageData {
  timestamp: Date
  sender: string
  content: string
  type: 'text' | 'media' | 'deleted'
  responseTime?: number
}

interface ParticipantStats {
  name: string
  messageCount: number
  averageResponseTime: number
  interestLevel: number
}

interface ChatAnalysisData {
  totalMessages: number
  participant1: ParticipantStats
  participant2: ParticipantStats
  dateRange: { start: Date; end: Date }
  conversationHealth: {
    balanceScore: number
    engagementScore: number
  }
}

export async function analyzeChatData(chatText: string): Promise<ChatAnalysisData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages = parseMessages(chatText)
      const enhancedMessages = calculateResponseTimes(messages)
      const analysis = formatAnalysisData(enhancedMessages)
      resolve(analysis)
    }, 1000)
  })
}

function parseMessages(chatText: string): MessageData[] {
  const messages: MessageData[] = []
  const lines = chatText.split('\n')

  const patterns = [
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*-\s*([^:]+):\s*(.*)$/,
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]\s*([^:]+):\s*(.*)$/,
    /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)$/,
  ]

  for (const line of lines) {
    if (line.trim() === '') continue

    let matched = false
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const [, dateStr, timeStr, sender, content] = match

        try {
          const timestamp = parseTimestamp(dateStr, timeStr)
          const messageType = getMessageType(content)

          messages.push({
            timestamp,
            sender: sender.trim(),
            content: content.trim(),
            type: messageType,
          })
          matched = true
          break
        } catch {
          console.warn('Failed to parse timestamp:', dateStr, timeStr)
        }
      }
    }

    if (!matched && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      lastMessage.content += '\n' + line.trim()
    }
  }

  return messages
}

function calculateResponseTimes(messages: MessageData[]): MessageData[] {
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

function formatAnalysisData(messages: MessageData[]): ChatAnalysisData {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      participant1: { name: 'Unknown', messageCount: 0, averageResponseTime: 0, interestLevel: 0 },
      participant2: { name: 'Unknown', messageCount: 0, averageResponseTime: 0, interestLevel: 0 },
      dateRange: { start: new Date(), end: new Date() },
      conversationHealth: { balanceScore: 0, engagementScore: 0 },
    }
  }

  const participants = Array.from(new Set(messages.map((m) => m.sender)))
  const participant1Name = participants[0] || 'Participant 1'
  const participant2Name = participants[1] || 'Participant 2'

  const participant1Stats = calculateParticipantStats(participant1Name, messages)
  const participant2Stats = calculateParticipantStats(participant2Name, messages)

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

function calculateParticipantStats(participantName: string, messages: MessageData[]): ParticipantStats {
  const participantMessages = messages.filter((m) => m.sender === participantName)
  const messageCount = participantMessages.length

  const responseTimes = participantMessages.filter((m) => m.responseTime !== undefined).map((m) => m.responseTime!)

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60 * 60)
      : 0

  const interestLevel = calculateInterestLevel(participantMessages, averageResponseTime)

  return {
    name: participantName,
    messageCount,
    averageResponseTime,
    interestLevel,
  }
}

function calculateInterestLevel(messages: MessageData[], averageResponseTime: number): number {
  if (messages.length === 0) return 0

  const responseTimeScore = Math.max(0, 40 - averageResponseTime * 2)
  const averageMessageLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length
  const lengthScore = Math.min(30, averageMessageLength / 5)
  const frequencyScore = Math.min(30, messages.length / 10)

  return Math.round(Math.min(100, responseTimeScore + lengthScore + frequencyScore))
}

function calculateBalanceScore(count1: number, count2: number): number {
  if (count1 === 0 && count2 === 0) return 0
  const ratio = Math.min(count1, count2) / Math.max(count1, count2)
  return Math.round(ratio * 100)
}

function calculateEngagementScore(participant1: ParticipantStats, participant2: ParticipantStats): number {
  return Math.round((participant1.interestLevel + participant2.interestLevel) / 2)
}

function parseTimestamp(dateStr: string, timeStr: string): Date {
  const dateParts = dateStr.split('/')
  let month: number, day: number, year: number

  if (dateParts.length === 3) {
    const part1 = parseInt(dateParts[0])
    const part2 = parseInt(dateParts[1])
    const part3 = parseInt(dateParts[2])

    if (part1 > 12) {
      day = part1
      month = part2
      year = part3
    } else if (part2 > 12) {
      month = part1
      day = part2
      year = part3
    } else {
      month = part1
      day = part2
      year = part3
    }

    if (year < 100) {
      year += year < 50 ? 2000 : 1900
    }
  } else {
    throw new Error('Invalid date format')
  }

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/)
  if (!timeMatch) {
    throw new Error('Invalid time format')
  }

  let hours = parseInt(timeMatch[1])
  const minutes = parseInt(timeMatch[2])
  const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0
  const ampm = timeMatch[4]?.toLowerCase()

  if (ampm) {
    if (ampm === 'pm' && hours !== 12) {
      hours += 12
    } else if (ampm === 'am' && hours === 12) {
      hours = 0
    }
  }

  return new Date(year, month - 1, day, hours, minutes, seconds)
}

function getMessageType(content: string): 'text' | 'media' | 'deleted' {
  const lowerContent = content.toLowerCase()

  if (
    lowerContent.includes('this message was deleted') ||
    lowerContent.includes('you deleted this message') ||
    lowerContent.includes('message deleted')
  ) {
    return 'deleted'
  }

  if (
    lowerContent.includes('<media omitted>') ||
    lowerContent.includes('image omitted') ||
    lowerContent.includes('video omitted') ||
    lowerContent.includes('audio omitted') ||
    lowerContent.includes('document omitted') ||
    lowerContent.includes('gif omitted') ||
    lowerContent.includes('sticker omitted')
  ) {
    return 'media'
  }

  return 'text'
}
