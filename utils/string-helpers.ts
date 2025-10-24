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
  // Comprehensive regex to match all emojis including:
  // - Basic emojis (😀-🙏)
  // - Miscellaneous symbols (☀-⛿)
  // - Dingbats (✀-➿)
  // - Transport and map (🚀-🛿)
  // - Regional indicator symbols (🇦-🇿)
  // - Supplemental symbols (🤀-🫿)
  // - Extended pictographs
  // - Emoji modifiers and sequences
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}][\p{Emoji_Modifier}]?(?:\u{200D}[\p{Emoji_Presentation}\p{Extended_Pictographic}][\p{Emoji_Modifier}]?)*/gu

  // Find all emojis in the name
  const emojis = fullName.match(emojiRegex) || []

  // Get first emoji (if exists)
  const firstEmoji = emojis[0] || ''

  // Remove all emojis to get clean text
  const cleanText = fullName.replace(emojiRegex, '').trim()

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
