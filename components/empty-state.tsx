import { InstructionContainer } from '@/components/instruction-container'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet } from 'react-native'

interface EmptyStateProps {
  hasShareData: boolean
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
}

export function EmptyState({
  hasShareData,
  showPlatform,
  manualInput,
  setManualInput,
  onManualImport,
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
})
