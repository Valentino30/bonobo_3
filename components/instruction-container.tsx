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
          <ThemedText style={styles.instructionNote}>
            Your chat will be automatically imported! The app supports both text and ZIP file exports.
          </ThemedText>
        </>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  instructionContainer: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A1A',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  instructionStep: {
    fontSize: 14,
    marginBottom: 10,
    paddingLeft: 4,
    color: '#333333',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  instructionNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
})
