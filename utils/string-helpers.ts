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
 * Gets initials from a full name (e.g., "John Doe" → "JD")
 * Returns '?' if no valid name is provided
 *
 * @param name Full name string
 * @returns Uppercase initials or '?'
 */
export function getNameInitials(name?: string): string {
  if (!name || name.trim().length === 0) {
    return '?'
  }

  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0][0].toUpperCase()
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Truncates text to a maximum length with ellipsis
 * Returns original text if it's shorter than max length
 *
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation (default: 100)
 * @returns Truncated text with '...' or original text
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}
