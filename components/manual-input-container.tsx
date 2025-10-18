import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
import { ThemedTextInput } from '@/components/themed-text-input'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, View } from 'react-native'

interface ManualInputContainerProps {
  manualInput: string
  setManualInput: (text: string) => void
  onImport: () => void
}

export function ManualInputContainer({ manualInput, setManualInput, onImport }: ManualInputContainerProps) {
  const theme = useTheme()

  const handleImport = () => {
    if (manualInput.trim()) {
      onImport()
      // Alert is handled by parent component (chats.tsx)
    }
  }

  return (
    <ThemedView style={[styles.manualInputContainer, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.backgroundSecondary, shadowColor: theme.colors.shadow }]}>
      <ThemedTextInput
        placeholder="Paste your WhatsApp chat export here..."
        value={manualInput}
        onChangeText={setManualInput}
        multiline
        textAlignVertical="top"
        containerStyle={styles.inputContainer}
        inputStyle={styles.multilineInput}
        fullWidth
      />
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Import Chat"
          onPress={handleImport}
          variant="primary"
          size="medium"
          disabled={!manualInput.trim()}
        />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  manualInputContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
  },
})
