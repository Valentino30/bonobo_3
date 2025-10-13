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
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
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
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    color: '#1A1A1A',
    letterSpacing: 0.1,
  },
  importButton: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  importButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  importButtonText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  importButtonTextDisabled: {
    color: '#999999',
  },
})
