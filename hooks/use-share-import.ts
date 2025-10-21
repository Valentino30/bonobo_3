import { useShareDataProcessor } from '@/hooks/use-share-data-processor'
import { type StoredChat } from '@/utils/chat-storage'
import { createShareImportAlerts } from '@/utils/share-import-alerts'
import { useMemo } from 'react'

type ShareData = {
  text?: string
  files?: string[]
}

type UseShareImportOptions = {
  shareData: ShareData | null
  hasShareData: boolean
  clearShareData: () => void
  addChat: (chat: StoredChat) => Promise<void>
  showAlert: (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => void
}

/**
 * High-level hook that combines share data processing with alert UI
 * This is a convenience wrapper around useShareDataProcessor that
 * automatically handles all alert display logic.
 *
 * Use this hook when you want the default alert behavior.
 * Use useShareDataProcessor directly if you need custom UI feedback.
 */
export function useShareImport({ shareData, hasShareData, clearShareData, addChat, showAlert }: UseShareImportOptions) {
  // Create alert configurations
  const alerts = useMemo(() => createShareImportAlerts(clearShareData), [clearShareData])

  // Use the base processor hook with alert callbacks
  useShareDataProcessor(shareData, hasShareData, {
    addChat,
    clearShareData,
    onSuccess: (participantNames, messageCount) => {
      const config = alerts.success(participantNames, messageCount)
      showAlert(config.title, config.message, config.buttons)
    },
    onZipExtractionFailed: () => {
      const config = alerts.zipExtractionFailed()
      showAlert(config.title, config.message, config.buttons)
    },
    onZipProcessingError: () => {
      const config = alerts.zipProcessingError()
      showAlert(config.title, config.message, config.buttons)
    },
    onNoTextData: () => {
      const config = alerts.noTextData()
      showAlert(config.title, config.message, config.buttons)
    },
  })
}
