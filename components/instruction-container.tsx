import { ManualInputContainer } from '@/components/manual-input-container'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet } from 'react-native'

interface InstructionContainerProps {
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
}

export function InstructionContainer({
  showPlatform,
  manualInput,
  setManualInput,
  onManualImport,
}: InstructionContainerProps) {
  return (
    <ThemedView style={styles.instructionContainer}>
      <ThemedText style={styles.instructionTitle}>How to import WhatsApp chats:</ThemedText>
      {showPlatform === 'ios' ? (
        <>
          <ThemedText style={styles.instructionStep}>1. Open WhatsApp</ThemedText>
          <ThemedText style={styles.instructionStep}>2. Go to any chat</ThemedText>
          <ThemedText style={styles.instructionStep}>3. Tap chat name → Export Chat</ThemedText>
          <ThemedText style={styles.instructionStep}>4. Choose &quot;Without Media&quot;</ThemedText>
          <ThemedText style={styles.instructionStep}>
            5. Select &quot;Copy to Clipboard&quot; or &quot;Save to Files&quot;
          </ThemedText>
          <ThemedText style={styles.instructionStep}>6. Return to this app and paste the content</ThemedText>
          <ThemedText style={styles.instructionNote}>
            Note: Direct sharing to this app is currently only available on Android. On iOS, please copy the exported
            chat and paste it below.
          </ThemedText>
          <ManualInputContainer manualInput={manualInput} setManualInput={setManualInput} onImport={onManualImport} />
        </>
      ) : (
        <>
          <ThemedText style={styles.instructionStep}>1. Open WhatsApp</ThemedText>
          <ThemedText style={styles.instructionStep}>2. Go to any chat</ThemedText>
          <ThemedText style={styles.instructionStep}>3. Tap ⋮ → Export chat</ThemedText>
          <ThemedText style={styles.instructionStep}>4. Choose &quot;Without Media&quot;</ThemedText>
          <ThemedText style={styles.instructionStep}>5. Select &quot;Bonobo Chat&quot;</ThemedText>
          <ThemedText style={styles.instructionNote}>Your chat will be automatically imported!</ThemedText>
        </>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  instructionContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6B8E5A',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#6B8E5A',
  },
  instructionStep: {
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 4,
  },
  instructionNote: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    lineHeight: 16,
  },
})
