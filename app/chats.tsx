import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useShareIntent } from '@/hooks/use-share-intent'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatsScreen() {
  const { shareData, hasShareData, clearShareData } = useShareIntent()
  const { device } = useLocalSearchParams<{ device?: string }>()
  const [chats, setChats] = useState<{ id: string; text: string; timestamp: Date }[]>([])
  const [manualInput, setManualInput] = useState('')

  // Determine which platform to show instructions for
  const showPlatform = device || Platform.OS

  useEffect(() => {
    if (hasShareData && shareData?.text) {
      // Process the shared WhatsApp chat
      const newChat = {
        id: Date.now().toString(),
        text: shareData.text,
        timestamp: new Date(),
      }
      setChats((prev) => [newChat, ...prev])

      // Show confirmation
      Alert.alert('Chat Imported', 'WhatsApp chat has been successfully imported!', [
        { text: 'OK', onPress: clearShareData },
      ])
    }
  }, [hasShareData, shareData, clearShareData])

  const handleManualImport = () => {
    if (manualInput.trim()) {
      const newChat = {
        id: Date.now().toString(),
        text: manualInput.trim(),
        timestamp: new Date(),
      }
      setChats((prev) => [newChat, ...prev])
      setManualInput('')

      Alert.alert('Chat Imported', 'Your WhatsApp chat has been successfully imported!', [{ text: 'OK' }])
    }
  }

  const formatChatPreview = (text: string) => {
    // Truncate long texts for preview
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Chats</ThemedText>

        {/* Chat list */}
        <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <ThemedView key={chat.id} style={styles.chatItem}>
                <ThemedText style={styles.chatTimestamp}>{chat.timestamp.toLocaleString()}</ThemedText>
                <ThemedText style={styles.chatText}>{formatChatPreview(chat.text)}</ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedView style={styles.emptyIconContainer}>
                <ThemedText style={styles.emptyIcon}>💬</ThemedText>
              </ThemedView>
              <ThemedText style={styles.emptyTitle}>
                {hasShareData ? 'Processing shared chat...' : 'No chats yet'}
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {hasShareData
                  ? 'Please wait while we import your WhatsApp chat'
                  : 'Share a WhatsApp chat to get started!'}
              </ThemedText>
              {!hasShareData && (
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
                      <ThemedText style={styles.instructionStep}>
                        6. Return to this app and paste the content
                      </ThemedText>
                      <ThemedText style={styles.instructionNote}>
                        Note: Direct sharing to this app is currently only available on Android. On iOS, please copy the
                        exported chat and paste it below.
                      </ThemedText>
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
                          onPress={handleManualImport}
                          disabled={!manualInput.trim()}
                        >
                          <ThemedText
                            style={[styles.importButtonText, !manualInput.trim() && styles.importButtonTextDisabled]}
                          >
                            Import Chat
                          </ThemedText>
                        </TouchableOpacity>
                      </ThemedView>
                    </>
                  ) : (
                    <>
                      <ThemedText style={styles.instructionStep}>1. Open WhatsApp</ThemedText>
                      <ThemedText style={styles.instructionStep}>2. Go to any chat</ThemedText>
                      <ThemedText style={styles.instructionStep}>3. Tap ⋮ → Export chat</ThemedText>
                      <ThemedText style={styles.instructionStep}>4. Choose &quot;Without Media&quot;</ThemedText>
                      <ThemedText style={styles.instructionStep}>5. Select &quot;Bonobo 3&quot;</ThemedText>
                      <ThemedText style={styles.instructionNote}>Your chat will be automatically imported!</ThemedText>
                    </>
                  )}
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ScrollView>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Back to Home</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6B8E5A',
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#F7F9F5',
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
    width: '100%',
  },
  chatItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B8E5A',
  },
  chatTimestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
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
