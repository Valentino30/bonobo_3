import { useMemo } from 'react'
import { useAddChatMutation } from '@/hooks/queries/use-chats-query'
import { useCustomAlert } from '@/hooks/ui/use-custom-alert'
import { useShareDataProcessor } from '@/hooks/use-share-data-processor'
import { createShareImportAlerts } from '@/utils/share-import-alerts'

type ShareData = {
  text?: string
  files?: string[]
}

type UseShareImportOptions = {
  shareData: ShareData | null
  hasShareData: boolean
  clearShareData: () => void
}

/**
 * High-level hook that combines share data processing with alert UI
 * This is a convenience wrapper around useShareDataProcessor that
 * automatically handles all alert display logic.
 *
 * Use this hook when you want the default alert behavior.
 * Use useShareDataProcessor directly if you need custom UI feedback.
 */
export function useShareImport({ shareData, hasShareData, clearShareData }: UseShareImportOptions) {
  const { showAlert, alert } = useCustomAlert()
  const addChatMutation = useAddChatMutation()

  // Create alert configurations
  const alerts = useMemo(() => createShareImportAlerts(clearShareData), [clearShareData])

  // Use the base processor hook with alert callbacks
  useShareDataProcessor(shareData, hasShareData, {
    addChat: async (chat) => {
      await addChatMutation.mutateAsync(chat)
    },
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

  return { alert }
}
