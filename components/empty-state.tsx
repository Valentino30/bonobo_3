import { InstructionContainer } from '@/components/instruction-container'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet, TouchableOpacity } from 'react-native'

interface EmptyStateProps {
  hasShareData: boolean
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
  onClearShareData?: () => void
}

export function EmptyState({
  hasShareData,
  showPlatform,
  manualInput,
  setManualInput,
  onManualImport,
  onClearShareData,
}: EmptyStateProps) {
  return (
    <ThemedView style={styles.emptyState}>
      <ThemedView style={styles.emptyIconContainer}>
        <ThemedText style={styles.emptyIcon}>💬</ThemedText>
      </ThemedView>
      <ThemedText style={styles.emptyTitle}>{hasShareData ? 'Processing shared chat...' : 'No chats yet'}</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {hasShareData ? 'Please wait while we import your WhatsApp chat' : 'Share a WhatsApp chat to get started!'}
      </ThemedText>

      {hasShareData && onClearShareData && (
        <TouchableOpacity style={styles.cancelButton} onPress={onClearShareData}>
          <ThemedText style={styles.cancelButtonText}>Cancel Import</ThemedText>
        </TouchableOpacity>
      )}

      {!hasShareData && (
        <InstructionContainer
          showPlatform={showPlatform}
          manualInput={manualInput}
          setManualInput={setManualInput}
          onManualImport={onManualImport}
        />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyIcon: {
    fontSize: 36,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 32,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
})
