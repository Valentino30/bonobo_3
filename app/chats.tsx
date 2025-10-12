import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Link } from 'expo-router'
import { StyleSheet, TouchableOpacity } from 'react-native'

export default function ChatsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Chats</ThemedText>
      <ThemedText style={styles.subtitle}>Your conversations will appear here</ThemedText>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Back to Home</ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  buttonText: {
    color: '#F7F9F5',
    fontWeight: '600',
  },
})
