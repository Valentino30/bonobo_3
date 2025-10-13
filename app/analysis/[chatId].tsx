import { AnalysisLoading } from '@/components/analysis-loading'
import { ComparisonCard } from '@/components/comparison-card'
import { InsightCard } from '@/components/insight-card'
import { LockedInsightCard } from '@/components/locked-insight-card'
import { Paywall } from '@/components/paywall'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { PaymentService } from '@/utils/payment-service'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { analyzeChat, type AIInsights } from '../../utils/ai-service'
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
  const previousChatIdRef = useRef<string | null>(null)

  const chat = chats.find((c) => c.id === chatId)

  // Initialize states - delay initialization until we know chats are loaded
  const [analysis, setAnalysis] = useState<ChatAnalysisData | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showPaywall, setShowPaywall] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [unlockedInsights, setUnlockedInsights] = useState<Set<string>>(new Set())
  const [loadingInsight, setLoadingInsight] = useState<string | null>(null)

  // Check user access on mount
  useEffect(() => {
    PaymentService.hasAccess().then(setHasAccess)
  }, [])

  // Handle tab change - insights tab is always accessible to see locked cards
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
  }

  // Handle unlock insight - check access and show paywall or unlock
  const handleUnlockInsight = async (insightId: string) => {
    const access = await PaymentService.hasAccess()

    if (!access) {
      // No access - show paywall
      setShowPaywall(true)
      return
    }

    // Has access - unlock this specific insight
    if (unlockedInsights.has(insightId)) {
      // Already unlocked, do nothing
      return
    }

    // Unlock the insight (generate AI data for this specific insight)
    setLoadingInsight(insightId)
    try {
      // If we don't have any AI insights yet, generate them all
      if (!aiInsights && chat) {
        const insights = await analyzeChat(chat.text)
        setAiInsights(insights)
        // Cache the insights
        if (analysis) {
          await updateChatAnalysis(chatId, analysis, insights)
        }
      }

      // Mark this insight as unlocked
      setUnlockedInsights((prev) => new Set([...prev, insightId]))
    } catch (err) {
      console.error('Error unlocking insight:', err)
      Alert.alert('Error', 'Failed to unlock insight. Please try again.')
    } finally {
      setLoadingInsight(null)
    }
  }

  // Handle purchase
  const handlePurchase = async (planId: string) => {
    try {
      // TODO: Implement actual Stripe payment here
      // For now, just grant access (for testing)
      Alert.alert(
        'Purchase Simulation',
        `This would normally process payment for ${planId}. For now, granting access for testing.`,
        [
          {
            text: 'OK',
            onPress: async () => {
              await PaymentService.grantAccess(planId)
              setHasAccess(true)
              setShowPaywall(false)
              setActiveTab('insights')
            },
          },
        ]
      )
    } catch (error) {
      console.error('Purchase error:', error)
      throw error
    }
  }

  useEffect(() => {
    console.log('Analysis screen - chatId:', chatId)
    console.log('Analysis screen - chats count:', chats.length)
    console.log('Analysis screen - chats loading:', chatsLoading)
    console.log('Analysis screen - chat found:', !!chat)
    console.log('Analysis screen - cached analysis:', !!chat?.analysis)

    // Reset unlocked insights AND AI insights ONLY when chatId changes
    if (previousChatIdRef.current !== chatId) {
      console.log('ChatId changed, resetting insights')
      setUnlockedInsights(new Set())
      setAiInsights(null)
      previousChatIdRef.current = chatId
    }

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

    // Check if we have cached basic analysis
    if (chat.analysis) {
      console.log('Using cached basic analysis')
      setAnalysis(chat.analysis)

      // DON'T load cached AI insights - user must unlock them each session
      // This ensures insights are never shown without proper unlock flow

      setIsAnalyzing(false)
      return
    }

    // If we don't have basic analysis, run it (but NOT AI analysis yet)
    console.log('No cached analysis found, performing basic analysis only')
    setIsAnalyzing(true)

    const performBasicAnalysis = async () => {
      try {
        const basicAnalysis = await analyzeChatData(chat.text)
        setAnalysis(basicAnalysis)

        // Save only basic analysis (no AI insights yet)
        await updateChatAnalysis(chatId, basicAnalysis)
        console.log('Basic analysis complete and cached')
      } catch (err) {
        console.error('Analysis error:', err)
        setError(err instanceof Error ? err.message : 'Failed to analyze chat')
      } finally {
        setIsAnalyzing(false)
      }
    }

    performBasicAnalysis()
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Chat Analysis
        </ThemedText>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => handleTabChange('overview')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'insights' && styles.tabActive]}
            onPress={() => handleTabChange('insights')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'insights' && styles.tabTextActive]}>Insights</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Paywall Modal */}
      <Paywall visible={showPaywall} onClose={() => setShowPaywall(false)} onPurchase={handlePurchase} />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        <View style={styles.content}>
          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <View style={styles.statsGrid}>
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
            </View>
          ) : (
            <View style={styles.insightsContainer}>
              {/* Red Flags */}
              {unlockedInsights.has('redFlags') && aiInsights ? (
                <InsightCard
                  icon="🚩"
                  title="Red Flags"
                  description={aiInsights.redFlags.description}
                  items={aiInsights.redFlags.items}
                  badge={{ text: `${aiInsights.redFlags.count} Found`, color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="🚩"
                  title="Red Flags"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('redFlags')}
                  isLoading={loadingInsight === 'redFlags'}
                />
              )}

              {/* Green Flags */}
              {unlockedInsights.has('greenFlags') && aiInsights ? (
                <InsightCard
                  icon="✅"
                  title="Green Flags"
                  description={aiInsights.greenFlags.description}
                  items={aiInsights.greenFlags.items}
                  badge={{ text: `${aiInsights.greenFlags.count} Found`, color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="✅"
                  title="Green Flags"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('greenFlags')}
                  isLoading={loadingInsight === 'greenFlags'}
                />
              )}

              {/* Attachment Style */}
              {unlockedInsights.has('attachmentStyle') && aiInsights ? (
                <InsightCard
                  icon="🔗"
                  title="Attachment Style"
                  description={aiInsights.attachmentStyle.description}
                  items={aiInsights.attachmentStyle.items}
                  badge={{ text: aiInsights.attachmentStyle.type, color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="🔗"
                  title="Attachment Style"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('attachmentStyle')}
                  isLoading={loadingInsight === 'attachmentStyle'}
                />
              )}

              {/* Reciprocity Score */}
              {unlockedInsights.has('reciprocityScore') && aiInsights ? (
                <InsightCard
                  icon="⚖️"
                  title="Reciprocity Score"
                  description={aiInsights.reciprocityScore.description}
                  items={aiInsights.reciprocityScore.items}
                  badge={{
                    text: `${aiInsights.reciprocityScore.percentage}% ${aiInsights.reciprocityScore.rating}`,
                    color: '#6B8E5A',
                  }}
                />
              ) : (
                <LockedInsightCard
                  icon="⚖️"
                  title="Reciprocity Score"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('reciprocityScore')}
                  isLoading={loadingInsight === 'reciprocityScore'}
                />
              )}

              {/* Compliments */}
              {unlockedInsights.has('compliments') && aiInsights ? (
                <InsightCard
                  icon="💐"
                  title="Compliments"
                  description={aiInsights.compliments.description}
                  items={aiInsights.compliments.breakdown}
                  badge={{ text: `${aiInsights.compliments.count} Found`, color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="💐"
                  title="Compliments"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('compliments')}
                  isLoading={loadingInsight === 'compliments'}
                />
              )}

              {/* Criticism */}
              {unlockedInsights.has('criticism') && aiInsights ? (
                <InsightCard
                  icon="⚠️"
                  title="Criticism"
                  description={aiInsights.criticism.description}
                  items={aiInsights.criticism.breakdown}
                  badge={{ text: `${aiInsights.criticism.count} Found`, color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="⚠️"
                  title="Criticism"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('criticism')}
                  isLoading={loadingInsight === 'criticism'}
                />
              )}

              {/* Compatibility Score */}
              {unlockedInsights.has('compatibilityScore') && aiInsights ? (
                <InsightCard
                  icon="💯"
                  title="Compatibility Score"
                  description={aiInsights.compatibilityScore.description}
                  items={aiInsights.compatibilityScore.items}
                  badge={{
                    text: `${aiInsights.compatibilityScore.percentage}% ${aiInsights.compatibilityScore.rating}`,
                    color: '#6B8E5A',
                  }}
                />
              ) : (
                <LockedInsightCard
                  icon="💯"
                  title="Compatibility Score"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('compatibilityScore')}
                  isLoading={loadingInsight === 'compatibilityScore'}
                />
              )}

              {/* Relationship Tips */}
              {unlockedInsights.has('relationshipTips') && aiInsights ? (
                <InsightCard
                  icon="💡"
                  title="Relationship Tips"
                  description={aiInsights.relationshipTips.description}
                  items={aiInsights.relationshipTips.tips}
                  badge={{ text: `${aiInsights.relationshipTips.count} Found`, color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="💡"
                  title="Relationship Tips"
                  badge={{ text: 'AI Insight', color: '#6B8E5A' }}
                  onUnlock={() => handleUnlockInsight('relationshipTips')}
                  isLoading={loadingInsight === 'relationshipTips'}
                />
              )}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Back to Chats</ThemedText>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#FAFAFA',
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
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
