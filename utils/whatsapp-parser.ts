export interface ParsedChatData {
  participants: string[]
  messageCount: number
  messages: {
    timestamp: string
    sender: string
    message: string
  }[]
}

export function parseWhatsAppChat(chatText: string): ParsedChatData {
  const lines = chatText.split('\n').filter((line) => line.trim())
  const messages: { timestamp: string; sender: string; message: string }[] = []
  const participantSet = new Set<string>()

  // WhatsApp export format: "DD/MM/YYYY, HH:MM - Sender: Message"
  // Alternative format: "[DD/MM/YYYY, HH:MM:SS] Sender: Message"
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}(?::\d{2})?)\s*[-\]]\s*([^:]+):\s*(.+)$/
  const altRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.+)$/

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

      messages.push({
        timestamp: timestamp.trim(),
        sender: cleanSender,
        message: message.trim(),
      })

      participantSet.add(cleanSender)
    }
  }

  return {
    participants: Array.from(participantSet).slice(0, 2), // Limit to 2 main participants
    messageCount: messages.length,
    messages,
  }
}
