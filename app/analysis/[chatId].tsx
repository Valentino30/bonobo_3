import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { analyzeChatData } from '../../utils/chat-analyzer'

interface ChatAnalysisData {
  totalMessages: number
  participant1: {
    name: string
    messageCount: number
    averageResponseTime: number
    interestLevel: number
  }
  participant2: {
    name: string
    messageCount: number
    averageResponseTime: number
    interestLevel: number
  }
  dateRange: { start: Date; end: Date }
  conversationHealth: {
    balanceScore: number
    engagementScore: number
  }
}

export default function ChatAnalysisScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>()
  const { chats } = usePersistedChats()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<ChatAnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chat = chats.find((c) => c.id === chatId)

  useEffect(() => {
    console.log('Analysis screen - chatId:', chatId)
    console.log('Analysis screen - chats count:', chats.length)
    console.log('Analysis screen - chat found:', !!chat)

    // Don't set error if chats are still loading (empty array)
    if (!chat && chats.length === 0) {
      console.log('Chats still loading, waiting...')
      return
    }

    if (!chat) {
      console.log('Chat not found for ID:', chatId)
      console.log(
        'Available chat IDs:',
        chats.map((c) => c.id)
      )
      setError('Chat not found')
      setIsAnalyzing(false)
      return
    }

    // Reset error state when chat is found
    setError(null)

    const performAnalysis = async () => {
      try {
        setIsAnalyzing(true)
        const result = await analyzeChatData(chat.text)
        setAnalysis(result)
      } catch (err) {
        console.error('Analysis error:', err)
        setError('Failed to analyze chat data')
      } finally {
        setIsAnalyzing(false)
      }
    }

    performAnalysis()
  }, [chat, chatId, chats])

  // Show loading if chats are still loading or we're analyzing
  if (!chat && chats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ActivityIndicator size="large" color="#6B8E5A" />
          <ThemedText style={styles.loadingText}>Loading chat data...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (!chat) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Chat Not Found</ThemedText>
          <ThemedText style={styles.errorText}>The requested chat could not be found.</ThemedText>
          <Link href="/chats" asChild>
            <TouchableOpacity style={styles.button}>
              <ThemedText style={styles.buttonText}>Back to Chats</ThemedText>
            </TouchableOpacity>
          </Link>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ActivityIndicator size="large" color="#6B8E5A" />
          <ThemedText style={styles.loadingText}>Analyzing chat data...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error || !analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Analysis Error</ThemedText>
          <ThemedText style={styles.errorText}>{error || 'Failed to analyze chat'}</ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Chat Analysis</ThemedText>

          {/* Total Messages Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{analysis.totalMessages}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Messages</ThemedText>
          </ThemedView>

          {/* Participant 1 Messages Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{analysis.participant1.messageCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Messages from {analysis.participant1.name}</ThemedText>
          </ThemedView>

          {/* Participant 2 Messages Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{analysis.participant2.messageCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Messages from {analysis.participant2.name}</ThemedText>
          </ThemedView>

          {/* Participant 1 Response Time Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>
              {analysis.participant1.averageResponseTime < 1
                ? `${Math.round(analysis.participant1.averageResponseTime * 60)}m`
                : `${analysis.participant1.averageResponseTime.toFixed(1)}h`}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Avg Response Time - {analysis.participant1.name}</ThemedText>
          </ThemedView>

          {/* Participant 2 Response Time Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>
              {analysis.participant2.averageResponseTime < 1
                ? `${Math.round(analysis.participant2.averageResponseTime * 60)}m`
                : `${analysis.participant2.averageResponseTime.toFixed(1)}h`}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Avg Response Time - {analysis.participant2.name}</ThemedText>
          </ThemedView>

          {/* Participant 1 Interest Level Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{analysis.participant1.interestLevel}%</ThemedText>
            <ThemedText style={styles.statLabel}>Interest Level - {analysis.participant1.name}</ThemedText>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${analysis.participant1.interestLevel}%` }]} />
            </ThemedView>
          </ThemedView>

          {/* Participant 2 Interest Level Card */}
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{analysis.participant2.interestLevel}%</ThemedText>
            <ThemedText style={styles.statLabel}>Interest Level - {analysis.participant2.name}</ThemedText>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${analysis.participant2.interestLevel}%` }]} />
            </ThemedView>
          </ThemedView>

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Back to Chats</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: '48%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B8E5A',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginTop: 8,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B8E5A',
    borderRadius: 3,
  },
  button: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    color: '#DC3545',
    marginVertical: 16,
  },
})
