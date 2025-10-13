import { AnalysisLoading } from '@/components/analysis-loading'
import { ComparisonCard } from '@/components/comparison-card'
import { InsightCard } from '@/components/insight-card'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { analyzeChatData } from '../../utils/chat-analyzer'

type TabType = 'overview' | 'insights'

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
  const { chats, isLoading: chatsLoading, updateChatAnalysis } = usePersistedChats()
  const router = useRouter()

  const chat = chats.find((c) => c.id === chatId)

  // Initialize states - delay initialization until we know chats are loaded
  const [analysis, setAnalysis] = useState<ChatAnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    console.log('Analysis screen - chatId:', chatId)
    console.log('Analysis screen - chats count:', chats.length)
    console.log('Analysis screen - chats loading:', chatsLoading)
    console.log('Analysis screen - chat found:', !!chat)
    console.log('Analysis screen - cached analysis:', !!chat?.analysis)

    // Don't do anything if chats are still loading
    if (chatsLoading) {
      console.log('Chats still loading, waiting...')
      return
    }

    // Mark as initialized once chats are loaded
    setInitialized(true)

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

    // Check if we have cached analysis - if so, use it
    if (chat.analysis) {
      console.log('Using cached analysis, skipping analysis')
      setAnalysis(chat.analysis)
      setIsAnalyzing(false)
      return
    }

    console.log('No cached analysis found, running analysis')
    const performAnalysis = async () => {
      try {
        setIsAnalyzing(true)

        // Start both the analysis and a minimum 4-second timer
        const [result] = await Promise.all([
          analyzeChatData(chat.text),
          new Promise((resolve) => setTimeout(resolve, 4000)), // Minimum 4 seconds (1s per step)
        ])

        setAnalysis(result)

        // Cache the analysis result
        await updateChatAnalysis(chatId, result)
      } catch (err) {
        console.error('Analysis error:', err)
        setError('Failed to analyze chat data')
      } finally {
        setIsAnalyzing(false)
      }
    }

    performAnalysis()
  }, [chat, chatId, chats, chatsLoading, updateChatAnalysis])

  // Show loading if chats are still loading OR we haven't initialized yet
  if (chatsLoading || !initialized) {
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
      {/* Fixed Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Chat Analysis
        </ThemedText>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'insights' && styles.tabActive]}
            onPress={() => setActiveTab('insights')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'insights' && styles.tabTextActive]}>Insights</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          {/* Tab Content */}
          {activeTab === 'overview' ? (
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
          ) : (
            <ThemedView style={styles.insightsContainer}>
              <InsightCard
                title="Red Flags"
                value={3}
                description="Potential concerns identified in the conversation patterns"
                items={[
                  'Delayed responses during important discussions',
                  'Inconsistent communication frequency',
                  'Occasional dismissive language detected',
                ]}
                badge={{ text: 'Low', color: '#F4B942' }}
              />

              <InsightCard
                title="Green Flags"
                value={8}
                description="Positive indicators of healthy communication"
                items={[
                  'Regular check-ins and thoughtful questions',
                  'Active listening with follow-up responses',
                  'Consistent emotional support expressions',
                  'Respectful disagreement handling',
                ]}
                badge={{ text: 'High', color: '#6B8E5A' }}
              />

              <InsightCard
                title="Attachment Style"
                value="Secure"
                description="Communication patterns suggest a balanced attachment approach"
                items={[
                  'Comfortable with emotional expression',
                  'Maintains healthy boundaries',
                  'Responsive to partner needs',
                ]}
              />

              <InsightCard
                title="Reciprocity Score"
                value="85%"
                description="Balance of give-and-take in conversation dynamics"
                badge={{ text: 'Excellent', color: '#6B8E5A' }}
              />

              <InsightCard
                title="Compliments"
                value={24}
                description="Frequency of positive affirmations and appreciation"
                items={['Appearance compliments: 8', 'Character compliments: 12', 'Achievement recognition: 4']}
              />

              <InsightCard
                title="Criticism"
                value={2}
                description="Instances of critical or negative feedback"
                items={['Constructive feedback: 2', 'Harsh criticism: 0']}
                badge={{ text: 'Healthy', color: '#6B8E5A' }}
              />

              <InsightCard
                title="Compatibility Score"
                value="82%"
                description="Overall alignment in communication style and emotional connection"
                badge={{ text: 'Very High', color: '#6B8E5A' }}
              />

              <InsightCard
                title="Relationship Tips"
                value="4 Tips"
                description="Personalized recommendations based on conversation analysis"
                items={[
                  'Schedule regular quality time without distractions',
                  'Practice active listening during serious topics',
                  'Express appreciation more frequently',
                  'Address minor conflicts before they escalate',
                ]}
              />
            </ThemedView>
          )}

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
  header: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6B8E5A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    marginTop: 12,
  },
  insightsContainer: {
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
