import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface CustomAlertProps {
  visible: boolean
  title: string
  message?: string
  buttons?: AlertButton[]
  onDismiss?: () => void
}

export function CustomAlert({ visible, title, message, buttons = [{ text: 'OK' }], onDismiss }: CustomAlertProps) {
  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.()
    onDismiss?.()
  }

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.buttonCancel
      case 'destructive':
        return styles.buttonDestructive
      default:
        return styles.buttonDefault
    }
  }

  const getButtonTextStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.buttonTextCancel
      case 'destructive':
        return styles.buttonTextDestructive
      default:
        return styles.buttonTextDefault
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Alert Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, getButtonStyle(button.style), buttons.length === 1 && styles.buttonSingle]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

// Hook for managing alert state
export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = React.useState<{
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: 0.1,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSingle: {
    borderRightWidth: 0,
  },
  buttonDefault: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  buttonCancel: {
    backgroundColor: '#F8F8F8',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  buttonDestructive: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  buttonTextDefault: {
    color: '#6B8E5A',
  },
  buttonTextCancel: {
    color: '#999999',
  },
  buttonTextDestructive: {
    color: '#FF6B6B',
  },
})
