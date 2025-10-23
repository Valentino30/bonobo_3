import { useState } from 'react'
import { type AlertButton, CustomAlert } from '@/components/custom-alert'

/**
 * Hook for managing custom alert state
 * Provides showAlert, hideAlert functions and JSX element to render
 *
 * @example
 * ```tsx
 * const { showAlert, alert } = useCustomAlert()
 *
 * // Show alert
 * showAlert('Delete Chat', 'Are you sure?', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'Delete', style: 'destructive', onPress: handleDelete }
 * ])
 *
 * // Render element
 * return (
 *   <>
 *     <YourContent />
 *     {alert}
 *   </>
 * )
 * ```
 */
export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean
    title: string
    message?: string
    buttons?: AlertButton[]
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
  })

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
    })
  }

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }))
  }

  const alert = (
    <CustomAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onDismiss={hideAlert}
    />
  )

  return { showAlert, hideAlert, alert }
}
