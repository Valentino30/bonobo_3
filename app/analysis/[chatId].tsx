import { AnalysisLoading } from '@/components/analysis-loading'
import { ComparisonCard } from '@/components/comparison-card'
import { SimpleStatCard } from '@/components/simple-stat-card'
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

        // Start both the analysis and a minimum 4-second timer
        const [result] = await Promise.all([
          analyzeChatData(chat.text),
          new Promise((resolve) => setTimeout(resolve, 4000)), // Minimum 4 seconds (1s per step)
        ])

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
        <AnalysisLoading />
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
          <ThemedText type="title" style={styles.title}>
            Chat Analysis
          </ThemedText>

          {/* Stats Grid */}
          <ThemedView style={styles.statsGrid}>
            {/* Total Messages Card */}
            <SimpleStatCard title="Total Messages" icon="💬" value={analysis.totalMessages} />

            {/* Messages per Participant Card */}
            <ComparisonCard
              title="Messages per Participant"
              icon="👥"
              participants={[
                {
                  name: analysis.participant1.name,
                  value: analysis.participant1.messageCount,
                },
                {
                  name: analysis.participant2.name,
                  value: analysis.participant2.messageCount,
                },
              ]}
            />

            {/* Response Time Card */}
            <ComparisonCard
              title="Average Response Time"
              icon="⏱️"
              participants={[
                {
                  name: analysis.participant1.name,
                  value:
                    analysis.participant1.averageResponseTime < 1
                      ? `${Math.round(analysis.participant1.averageResponseTime * 60)}m`
                      : `${analysis.participant1.averageResponseTime.toFixed(1)}h`,
                },
                {
                  name: analysis.participant2.name,
                  value:
                    analysis.participant2.averageResponseTime < 1
                      ? `${Math.round(analysis.participant2.averageResponseTime * 60)}m`
                      : `${analysis.participant2.averageResponseTime.toFixed(1)}h`,
                },
              ]}
            />

            {/* Interest Level Card */}
            <ComparisonCard
              title="Interest Level"
              icon="❤️"
              participants={[
                {
                  name: analysis.participant1.name,
                  value: `${analysis.participant1.interestLevel}%`,
                  progressValue: analysis.participant1.interestLevel,
                  progressColor: '#0288D1',
                },
                {
                  name: analysis.participant2.name,
                  value: `${analysis.participant2.interestLevel}%`,
                  progressValue: analysis.participant2.interestLevel,
                  progressColor: '#C2185B',
                },
              ]}
            />
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
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  statsGrid: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#6B8E5A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666666',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF6B6B',
    marginVertical: 16,
    fontSize: 14,
    letterSpacing: 0.1,
  },
})
