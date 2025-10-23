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
