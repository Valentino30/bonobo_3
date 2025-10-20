import { useState } from 'react'
import { CustomAlert, type AlertButton } from '@/components/custom-alert'

/**
 * Hook for managing custom alert state
 * Provides showAlert, hideAlert functions and an AlertComponent to render
 *
 * @example
 * ```tsx
 * const { showAlert, AlertComponent } = useCustomAlert()
 *
 * // Show alert
 * showAlert('Delete Chat', 'Are you sure?', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'Delete', style: 'destructive', onPress: handleDelete }
 * ])
 *
 * // Render component
 * return (
 *   <>
 *     <YourContent />
 *     <AlertComponent />
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

  const AlertComponent = () => (
    <CustomAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onDismiss={hideAlert}
    />
  )

  return { showAlert, hideAlert, AlertComponent }
}
