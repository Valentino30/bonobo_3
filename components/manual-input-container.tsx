import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native'

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
      <TextInput
        style={[styles.manualInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Paste your WhatsApp chat export here..."
        placeholderTextColor={theme.colors.textPlaceholder}
        value={manualInput}
        onChangeText={setManualInput}
        multiline
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.importButton, { backgroundColor: manualInput.trim() ? theme.colors.primary : theme.colors.border }]}
        onPress={handleImport}
        disabled={!manualInput.trim()}
      >
        <ThemedText style={[styles.importButtonText, { color: manualInput.trim() ? theme.colors.textWhite : theme.colors.textTertiary }]}>
          Import Chat
        </ThemedText>
      </TouchableOpacity>
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
  manualInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    letterSpacing: 0.1,
  },
  importButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  importButtonText: {
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
})
