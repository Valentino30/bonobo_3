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
import { StripeService } from '@/utils/stripe-service'
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
  const [unlockedInsights, setUnlockedInsights] = useState<Set<string>>(new Set())
  const [loadingInsight, setLoadingInsight] = useState<string | null>(null)

  // Load unlocked insights from cached chat data
  useEffect(() => {
    if (chat?.unlockedInsights) {
      setUnlockedInsights(new Set(chat.unlockedInsights))
    }
  }, [chat])

  // Helper to check if an insight should be shown as unlocked
  const isInsightUnlocked = (insightId: string): boolean => {
    const unlocked = unlockedInsights.has(insightId)
    console.log(`Checking if ${insightId} is unlocked:`, unlocked, 'All unlocked:', Array.from(unlockedInsights))
    return unlocked
  }

  // Helper to get frequency label from count
  const getFrequencyLabel = (count: number): string => {
    if (count === 0) return 'None'
    if (count === 1) return 'Rare'
    if (count <= 3) return 'Few'
    if (count <= 7) return 'Occasional'
    if (count <= 15) return 'Moderate'
    if (count <= 25) return 'Frequent'
    return 'Very Frequent'
  }

  // Handle tab change - insights tab is always accessible to see locked cards
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
  }

  // Handle unlock insight - check access and show paywall or unlock
  const handleUnlockInsight = async (insightId: string) => {
    console.log('🔓 handleUnlockInsight called for:', insightId)
    console.log('Current unlockedInsights:', Array.from(unlockedInsights))

    const access = await PaymentService.hasAccess(chatId)
    console.log('Access check result:', access)

    if (!access) {
      // No access - show paywall
      console.log('❌ No access - showing paywall')
      setShowPaywall(true)
      return
    }

    // Has access - unlock this specific insight
    if (unlockedInsights.has(insightId)) {
      // Already unlocked, do nothing
      console.log('✅ Insight already unlocked')
      return
    }

    console.log('🔄 Starting unlock process...')
    // Unlock the insight (generate AI data for this specific insight)
    setLoadingInsight(insightId)
    try {
      // If we don't have any AI insights yet, generate them all
      let insights = aiInsights
      if (!aiInsights && chat) {
        console.log('📊 Generating AI insights...')
        insights = await analyzeChat(chat.text)
        setAiInsights(insights)
        console.log('✅ AI insights generated')

        // Assign this one-time purchase to this specific chat (only on first unlock and only for one-time purchases)
        // Skip this for subscriptions
        const hasSubscription = await PaymentService.hasActiveSubscription()
        if (!hasSubscription) {
          console.log('🔗 Assigning one-time entitlement to chat...')
          await PaymentService.assignAnalysisToChat(chatId)
          console.log('✅ Entitlement assigned')
        } else {
          console.log('ℹ️ Subscription active - no need to assign to chat')
        }
      }

      // Mark this insight as unlocked and persist it
      const newUnlockedInsights = new Set([...unlockedInsights, insightId])
      console.log('New unlockedInsights:', Array.from(newUnlockedInsights))
      setUnlockedInsights(newUnlockedInsights)

      // Save to storage
      if (analysis) {
        console.log('💾 Saving to storage...')
        await updateChatAnalysis(chatId, analysis, insights || undefined, Array.from(newUnlockedInsights))
        console.log('✅ Saved to storage')
      } else {
        console.warn('⚠️ No analysis to save!')
      }

      console.log('🎉 Unlock complete!')
    } catch (err) {
      console.error('❌ Error unlocking insight:', err)
      Alert.alert('Error', 'Failed to unlock insight. Please try again.')
    } finally {
      setLoadingInsight(null)
    }
  }

  // Handle purchase
  const handlePurchase = async (planId: string) => {
    try {
      // Initialize Stripe payment - this will show the payment sheet
      const result = await StripeService.initializePayment(planId)

      if (result.success) {
        // Payment successful - entitlement is now in database
        // No need to call grantAccess() - it's handled by the Edge Function

        setShowPaywall(false)
        setActiveTab('insights')
        Alert.alert('🎉 Payment Successful!', 'You now have access to AI insights')
      } else {
        // Payment failed or cancelled
        if (result.error) {
          Alert.alert('Payment Failed', result.error)
        }
        // User cancelled - no alert needed
      }
    } catch (error) {
      console.error('Purchase error:', error)
      Alert.alert('Error', 'Failed to process payment. Please try again.')
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

      // Load cached AI insights if they exist (user has already unlocked some)
      if (chat.aiInsights) {
        console.log('Loading cached AI insights')
        setAiInsights(chat.aiInsights)
      }

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
              {isInsightUnlocked('redFlags') && aiInsights ? (
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
                  onUnlock={() => handleUnlockInsight('redFlags')}
                  isLoading={loadingInsight === 'redFlags'}
                  unlockText="What are the warning signs?"
                />
              )}

              {/* Green Flags */}
              {isInsightUnlocked('greenFlags') && aiInsights ? (
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
                  onUnlock={() => handleUnlockInsight('greenFlags')}
                  isLoading={loadingInsight === 'greenFlags'}
                  unlockText="What are the positive signs?"
                />
              )}

              {/* Attachment Style */}
              {isInsightUnlocked('attachmentStyle') && aiInsights ? (
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
                  onUnlock={() => handleUnlockInsight('attachmentStyle')}
                  isLoading={loadingInsight === 'attachmentStyle'}
                  unlockText="What's the attachment pattern?"
                />
              )}

              {/* Reciprocity Score */}
              {isInsightUnlocked('reciprocityScore') && aiInsights ? (
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
                  onUnlock={() => handleUnlockInsight('reciprocityScore')}
                  isLoading={loadingInsight === 'reciprocityScore'}
                  unlockText="How balanced is this relationship?"
                />
              )}

              {/* Compliments */}
              {isInsightUnlocked('compliments') && aiInsights ? (
                <InsightCard
                  icon="💐"
                  title="Compliments"
                  description={aiInsights.compliments.description}
                  items={aiInsights.compliments.items}
                  badge={{ text: getFrequencyLabel(aiInsights.compliments.count), color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="💐"
                  title="Compliments"
                  onUnlock={() => handleUnlockInsight('compliments')}
                  isLoading={loadingInsight === 'compliments'}
                  unlockText="How often do they compliment?"
                />
              )}

              {/* Criticism */}
              {isInsightUnlocked('criticism') && aiInsights ? (
                <InsightCard
                  icon="⚠️"
                  title="Criticism"
                  description={aiInsights.criticism.description}
                  items={aiInsights.criticism.items}
                  badge={{ text: getFrequencyLabel(aiInsights.criticism.count), color: '#6B8E5A' }}
                />
              ) : (
                <LockedInsightCard
                  icon="⚠️"
                  title="Criticism"
                  onUnlock={() => handleUnlockInsight('criticism')}
                  isLoading={loadingInsight === 'criticism'}
                  unlockText="Are there critical moments?"
                />
              )}

              {/* Compatibility Score */}
              {isInsightUnlocked('compatibilityScore') && aiInsights ? (
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
                  onUnlock={() => handleUnlockInsight('compatibilityScore')}
                  isLoading={loadingInsight === 'compatibilityScore'}
                  unlockText="How compatible are you?"
                />
              )}

              {/* Relationship Tips */}
              {isInsightUnlocked('relationshipTips') && aiInsights ? (
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
                  onUnlock={() => handleUnlockInsight('relationshipTips')}
                  isLoading={loadingInsight === 'relationshipTips'}
                  unlockText="What can you improve?"
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
