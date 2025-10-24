/**
 * Gets the first letter of the first participant's name for avatar display
 * Returns '?' if no valid participant name is found
 *
 * @param participants Array of participant names
 * @returns Single uppercase letter or '?'
 */
export function getParticipantInitial(participants?: string[]): string {
  if (!participants || participants.length === 0) {
    return '?'
  }

  const firstParticipant = participants[0]
  if (!firstParticipant || firstParticipant.trim().length === 0) {
    return '?'
  }

  return firstParticipant.trim()[0].toUpperCase()
}

/**
 * Extract the first word from a participant name and keep the first emoji if present
 * Examples:
 * "Jasmine (Bali)" -> "Jasmine"
 * "Vale 🇮🇹 🎉" -> "Vale 🇮🇹"
 * "🔥 John Smith" -> "🔥 John"
 * "John Smith 🎉" -> "John 🎉"
 */
export function extractFirstName(fullName: string): string {
  // Regex patterns for different emoji types
  // Flag emojis: Two regional indicator symbols (e.g., 🇮🇹)
  const flagEmojiRegex = /\p{Regional_Indicator}{2}/gu

  // All other emojis including:
  // - Basic emojis, symbols, pictographs
  // - Emoji with skin tone modifiers
  // - Multi-person emojis with zero-width joiners
  // - Emoji with variation selectors
  const otherEmojiRegex = /(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)(?:\p{Emoji_Modifier}|\u200D\p{Emoji}|\uFE0F)*/gu

  // Find all emojis (flags first, then others)
  const flags = fullName.match(flagEmojiRegex) || []
  const otherEmojis = fullName.match(otherEmojiRegex) || []

  // Combine and deduplicate (flags might be caught by both regexes)
  const allEmojis = [...new Set([...flags, ...otherEmojis])]

  // Get the first emoji as it appears in the original string
  let firstEmoji = ''
  let earliestIndex = fullName.length

  for (const emoji of allEmojis) {
    const index = fullName.indexOf(emoji)
    if (index !== -1 && index < earliestIndex) {
      earliestIndex = index
      firstEmoji = emoji
    }
  }

  // Remove all emojis to get clean text
  let cleanText = fullName
  for (const emoji of allEmojis) {
    cleanText = cleanText.replace(emoji, '')
  }
  cleanText = cleanText.trim()

  // Get first word (split by space or parenthesis)
  const firstWord = cleanText.split(/[\s(]+/)[0]

  if (!firstWord) {
    return fullName // Fallback to original if extraction fails
  }

  // Return first word with first emoji (if it exists)
  return firstEmoji ? `${firstWord} ${firstEmoji}` : firstWord
}

/**
 * Count words in a message
 * Splits by whitespace and filters out empty strings
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}
