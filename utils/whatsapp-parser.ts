import type { MessageData } from '@/types/chat-analysis'
import { extractFirstName } from './string-helpers'

export interface ParsedChatData {
  participants: string[]
  messageCount: number
  messages: {
    timestamp: string
    sender: string
    message: string
  }[]
}

/**
 * Parse WhatsApp chat export into detailed message data with timestamps and types
 * Used by chat statistics calculator
 */
export function parseWhatsAppMessages(chatText: string): MessageData[] {
  const messages: MessageData[] = []
  const lines = chatText.split('\n')

  const patterns = [
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*-\s*([^:]+):\s*(.*)$/,
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]\s*([^:]+):\s*(.*)$/,
    /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)$/,
  ]

  for (const line of lines) {
    if (line.trim() === '') continue

    // Skip system messages
    if (isSystemMessage(line)) {
      continue
    }

    let matched = false
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const [, dateStr, timeStr, sender, content] = match
        const cleanSender = sender.trim()

        if (shouldSkipMessage(cleanSender, content)) {
          matched = true
          break
        }

        try {
          const timestamp = parseTimestamp(dateStr, timeStr)
          const messageType = getMessageType(content)
          const firstName = extractFirstName(cleanSender)

          messages.push({
            timestamp,
            sender: firstName,
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

    // Append continuation lines to last message
    if (!matched && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      lastMessage.content += '\n' + line.trim()
    }
  }

  return messages
}

/**
 * Simple parser for basic chat info (participants and message count)
 * Used by share data processor
 */
export function parseWhatsAppChat(chatText: string): ParsedChatData {
  const lines = chatText.split('\n').filter((line) => line.trim())
  const messages: { timestamp: string; sender: string; message: string }[] = []
  const participantSet = new Set<string>()

  // WhatsApp export format variations:
  // "DD/MM/YYYY, HH:MM - Sender: Message" (European format)
  // "M/DD/YY, HH:MM - Sender: Message" (US format)
  // "[DD/MM/YYYY, HH:MM:SS] Sender: Message" (Alternative format)
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2}),?\s+\d{1,2}:\d{2}(?::\d{2})?)\s*[-]\s*([^:]+):\s*(.+)$/
  const altRegex = /^\[(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2}),?\s+\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.+)$/

  for (const line of lines) {
    // Skip system messages and empty lines
    if (
      line.includes('Messages and calls are end-to-end encrypted') ||
      line.includes('changed the subject') ||
      line.includes('left') ||
      line.includes('joined') ||
      line.includes('created group') ||
      line.trim() === ''
    ) {
      continue
    }

    let match = line.match(messageRegex) || line.match(altRegex)

    if (match) {
      const [, timestamp, sender, message] = match
      const cleanSender = sender.trim()

      // Skip system messages by sender name patterns
      if (
        cleanSender.includes('WhatsApp') ||
        cleanSender.includes('System') ||
        message.includes('<Media omitted>') ||
        message.includes('This message was deleted')
      ) {
        continue
      }

      // Extract first name only
      const firstName = extractFirstName(cleanSender)

      messages.push({
        timestamp: timestamp.trim(),
        sender: firstName,
        message: message.trim(),
      })

      participantSet.add(firstName)
    }
  }

  return {
    participants: Array.from(participantSet).slice(0, 2), // Limit to 2 main participants
    messageCount: messages.length,
    messages,
  }
}

// Helper functions for message parsing

function isSystemMessage(line: string): boolean {
  return (
    line.includes('Messages and calls are end-to-end encrypted') ||
    line.includes('changed the subject') ||
    line.includes('left') ||
    line.includes('joined') ||
    line.includes('created group')
  )
}

function shouldSkipMessage(sender: string, content: string): boolean {
  return (
    sender.includes('WhatsApp') ||
    sender.includes('System') ||
    content.includes('<Media omitted>') ||
    content.includes('This message was deleted')
  )
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
