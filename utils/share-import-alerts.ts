/**
 * Alert configurations for share import flows
 * Centralizes all import-related alert messages for consistency
 */

type AlertButton = {
  text: string
  onPress?: () => void
}

export type AlertConfig = {
  title: string
  message: string
  buttons: AlertButton[]
}

/**
 * Creates alert configurations for share import scenarios
 */
export function createShareImportAlerts(clearShareData: () => void) {
  return {
    success: (participantNames: string, messageCount: number): AlertConfig => ({
      title: 'Chat Imported Successfully!',
      message: `Chat between ${participantNames} with ${messageCount} messages has been imported.`,
      buttons: [
        {
          text: 'OK',
          onPress: clearShareData,
        },
      ],
    }),

    zipExtractionFailed: (): AlertConfig => ({
      title: 'ZIP Extraction Failed',
      message:
        'Could not extract chat content from the ZIP file. Please try exporting the chat as "Without Media" or use manual import.',
      buttons: [
        {
          text: 'OK',
          onPress: clearShareData,
        },
        {
          text: 'Try Manual Import',
          onPress: clearShareData,
        },
      ],
    }),

    zipProcessingError: (): AlertConfig => ({
      title: 'ZIP Processing Error',
      message: 'An error occurred while processing the ZIP file. Please try again or use manual import.',
      buttons: [
        {
          text: 'OK',
          onPress: clearShareData,
        },
      ],
    }),

    noTextData: (): AlertConfig => ({
      title: 'Import Error',
      message: 'No text data was found in the shared content. Please try exporting the chat again or use manual import.',
      buttons: [
        {
          text: 'OK',
          onPress: clearShareData,
        },
      ],
    }),

    manualImportSuccess: (participantNames: string, messageCount: number): AlertConfig => ({
      title: 'Chat Imported Successfully!',
      message: `Chat between ${participantNames} with ${messageCount} messages has been imported.`,
      buttons: [{ text: 'OK' }],
    }),
  }
}
