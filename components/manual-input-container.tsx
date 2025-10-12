import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native'

interface ManualInputContainerProps {
  manualInput: string
  setManualInput: (text: string) => void
  onImport: () => void
}

export function ManualInputContainer({ manualInput, setManualInput, onImport }: ManualInputContainerProps) {
  const handleImport = () => {
    if (manualInput.trim()) {
      onImport()
      Alert.alert('Chat Imported', 'Your WhatsApp chat has been successfully imported!', [{ text: 'OK' }])
    }
  }

  return (
    <ThemedView style={styles.manualInputContainer}>
      <TextInput
        style={styles.manualInput}
        placeholder="Paste your WhatsApp chat export here..."
        value={manualInput}
        onChangeText={setManualInput}
        multiline
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.importButton, !manualInput.trim() && styles.importButtonDisabled]}
        onPress={handleImport}
        disabled={!manualInput.trim()}
      >
        <ThemedText style={[styles.importButtonText, !manualInput.trim() && styles.importButtonTextDisabled]}>
          Import Chat
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  manualInputContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  manualInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#F9F9F9',
  },
  importButton: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  importButtonDisabled: {
    backgroundColor: '#CCC',
  },
  importButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  importButtonTextDisabled: {
    color: '#888',
  },
})
