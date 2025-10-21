import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { type AlertButton } from './custom-alert'

interface AlertButtonItemProps {
  button: AlertButton
  isLast: boolean
  isSingle: boolean
  onPress: (button: AlertButton) => void
}

export function AlertButtonItem({ button, isLast, isSingle, onPress }: AlertButtonItemProps) {
  const theme = useTheme()

  const buttonStyles = {
    cancel: {
      background: theme.colors.backgroundInput,
      text: theme.colors.textTertiary,
    },
    destructive: {
      background: theme.colors.backgroundLight,
      text: theme.colors.warning,
    },
    default: {
      background: theme.colors.backgroundLight,
      text: theme.colors.primary,
    },
  }

  const styleKey = button.style === 'cancel' || button.style === 'destructive' ? button.style : 'default'
  const buttonStyle = buttonStyles[styleKey]

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonStyle.background },
        isSingle && styles.buttonSingle,
        !isLast && { borderRightWidth: 1, borderRightColor: theme.colors.backgroundSecondary },
      ]}
      onPress={() => onPress(button)}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: buttonStyle.text }]}>{button.text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
