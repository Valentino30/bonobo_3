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
 * Extract the first word from a participant name
 * Examples:
 * "Jasmine (Bali)" -> "Jasmine"
 * "Vale 🇮🇹" -> "Vale"
 * "John Smith" -> "John"
 */
function extractFirstName(fullName: string): string {
  // Remove emojis and special characters, then get first word
  const cleaned = fullName
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    .trim()

  // Get first word (split by space or parenthesis)
  const firstWord = cleaned.split(/[\s(]+/)[0]
  return firstWord || fullName // Fallback to original if extraction fails
}

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
