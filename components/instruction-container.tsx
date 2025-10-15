import { ManualInputContainer } from '@/components/manual-input-container'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

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
  const theme = useTheme()

  return (
    <ThemedView style={[styles.instructionContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.backgroundSecondary }]}>
      <ThemedText style={[styles.instructionTitle, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>How to import WhatsApp chats:</ThemedText>
      {showPlatform === 'ios' ? (
        <>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>1. Open WhatsApp</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>2. Go to any chat</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>3. Tap chat name → Export Chat</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>4. Choose &quot;Without Media&quot;</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>
            5. Select &quot;Copy to Clipboard&quot; or &quot;Save to Files&quot;
          </ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>6. Return to this app and paste the content</ThemedText>
          <ThemedText style={[styles.instructionNote, { color: theme.colors.textSecondary, borderTopColor: theme.colors.border }]}>
            Note: Direct sharing to this app is currently only available on Android. On iOS, please copy the exported
            chat and paste it below.
          </ThemedText>
          <ManualInputContainer manualInput={manualInput} setManualInput={setManualInput} onImport={onManualImport} />
        </>
      ) : (
        <>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>1. Open WhatsApp</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>2. Go to any chat</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>3. Tap ⋮ → Export chat</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>4. Choose &quot;Without Media&quot;</ThemedText>
          <ThemedText style={[styles.instructionStep, { color: theme.colors.textDark }]}>5. Select &quot;Bonobo Chat&quot;</ThemedText>
          <ThemedText style={[styles.instructionNote, { color: theme.colors.textSecondary, borderTopColor: theme.colors.border }]}>
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
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  instructionStep: {
    fontSize: 14,
    marginBottom: 10,
    paddingLeft: 4,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  instructionNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
})
