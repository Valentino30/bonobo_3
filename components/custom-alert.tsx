import { useTheme } from '@/contexts/theme-context'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export interface AlertButton {
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
  const theme = useTheme()

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.()
    onDismiss?.()
  }

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return { backgroundColor: theme.colors.backgroundInput }
      case 'destructive':
        return { backgroundColor: theme.colors.backgroundLight }
      default:
        return { backgroundColor: theme.colors.backgroundLight }
    }
  }

  const getButtonTextStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return { color: theme.colors.textTertiary }
      case 'destructive':
        return { color: theme.colors.warning }
      default:
        return { color: theme.colors.primary }
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.backgroundOverlay }]}>
        <View style={[styles.alertContainer, { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow }]}>
          {/* Alert Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            {message && <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>}
          </View>

          {/* Buttons */}
          <View style={[styles.buttonContainer, { borderTopColor: theme.colors.backgroundSecondary }]}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, getButtonStyle(button.style), buttons.length === 1 && styles.buttonSingle, index < buttons.length - 1 && { borderRightWidth: 1, borderRightColor: theme.colors.backgroundSecondary }]}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
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
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
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
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
})
