/**
 * Alert configurations for share import flows
 * Centralizes all import-related alert messages for consistency
 */
import i18n from '@/i18n/config'

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
export function createShareImportAlerts(clearShareData?: () => void) {
  return {
    success: (participantNames: string, messageCount: number): AlertConfig => ({
      title: i18n.t('import.successTitle'),
      message: i18n.t('import.successMessage', { participants: participantNames, count: messageCount }),
      buttons: [
        {
          text: i18n.t('alerts.great'),
          onPress: clearShareData,
        },
      ],
    }),

    zipExtractionFailed: (): AlertConfig => ({
      title: i18n.t('import.zipExtractionFailedTitle'),
      message: i18n.t('import.zipExtractionFailedMessage'),
      buttons: [
        {
          text: i18n.t('alerts.ok'),
          onPress: clearShareData,
        },
        {
          text: i18n.t('import.tryManualImport'),
          onPress: clearShareData,
        },
      ],
    }),

    zipProcessingError: (): AlertConfig => ({
      title: i18n.t('import.zipProcessingErrorTitle'),
      message: i18n.t('import.zipProcessingErrorMessage'),
      buttons: [
        {
          text: i18n.t('alerts.ok'),
          onPress: clearShareData,
        },
      ],
    }),

    noTextData: (): AlertConfig => ({
      title: i18n.t('import.noTextDataTitle'),
      message: i18n.t('import.noTextDataMessage'),
      buttons: [
        {
          text: i18n.t('alerts.ok'),
          onPress: clearShareData,
        },
      ],
    }),
  }
}
