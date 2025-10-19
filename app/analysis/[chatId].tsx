import { AnalysisLoading } from '@/components/analysis-loading'
import { ComparisonCard } from '@/components/comparison-card'
import { useCustomAlert } from '@/components/custom-alert'
import { InsightCard } from '@/components/insight-card'
import { LockedInsightCard } from '@/components/locked-insight-card'
import { PaymentAuthScreen } from '@/components/payment-auth-screen'
import { Paywall } from '@/components/paywall'
import { ScreenHeader } from '@/components/screen-header'
import { SimpleStatCard } from '@/components/simple-stat-card'
import { ThemedButton } from '@/components/themed-button'
import { ThemedTabButton } from '@/components/themed-tab-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { useChatAnalysis } from '@/hooks/use-chat-analysis'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatAnalysisScreen() {
  const theme = useTheme()
  const { showAlert, AlertComponent } = useCustomAlert()

  // All business logic encapsulated in custom hook
  const {
    chat,
    chatId,
    chatsLoading,
    analysis,
    aiInsights,
    showLoadingAnimation,
    error,
    activeTab,
    showPaywall,
    showAuthScreen,
    loadingInsight,
    isInsightUnlocked,
    getFrequencyLabel,
    handleTabChange,
    handleUnlockInsight,
    handlePurchase,
    handleAuthSuccess,
    handleLoadingComplete,
    handleGoBack,
    handleNavigateToChats,
    setShowPaywall,
    setShowAuthScreen,
  } = useChatAnalysis({ showAlert })

  // Show loading animation
  if (chatsLoading || !analysis || showLoadingAnimation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AnalysisLoading key={chatId} onComplete={handleLoadingComplete} />
      </SafeAreaView>
    )
  }

  // Show chat not found error
  if (!chat && !chatsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Chat Not Found</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>
            The requested chat could not be found.
          </ThemedText>
          <ThemedButton title="Back to Chats" onPress={handleNavigateToChats} variant="primary" size="large" />
        </ThemedView>
      </SafeAreaView>
    )
  }

  // Show analysis error
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Analysis Error</ThemedText>
          <ThemedText style={[styles.errorText, { color: theme.colors.warning }]}>{error}</ThemedText>
          <ThemedButton title="Go Back" onPress={handleGoBack} variant="primary" size="large" />
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Fixed Header */}
      <ScreenHeader title="Chat Analysis" style={[styles.header, { backgroundColor: theme.colors.background }]}>
        {/* Tab Navigation */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
          ]}
        >
          <ThemedTabButton
            label="Overview"
            icon="chart-box-outline"
            isActive={activeTab === 'overview'}
            onPress={() => handleTabChange('overview')}
          />
          <ThemedTabButton
            label="Insights"
            icon="auto-fix"
            isActive={activeTab === 'insights'}
            onPress={() => handleTabChange('insights')}
          />
        </View>
      </ScreenHeader>

      {/* Custom Alert */}
      <AlertComponent />

      {/* Paywall Modal */}
      <Paywall visible={showPaywall} onClose={() => setShowPaywall(false)} onPurchase={handlePurchase} />

      {/* Auth Screen Modal */}
      <PaymentAuthScreen
        visible={showAuthScreen}
        onClose={() => setShowAuthScreen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
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

              {/* Average Message Length Card */}
              <ComparisonCard
                title="Average Message Length"
                icon="📝"
                participants={[
                  {
                    name: analysis.participant1.name,
                    value: `${analysis.participant1.averageMessageLength} chars`,
                  },
                  {
                    name: analysis.participant2.name,
                    value: `${analysis.participant2.averageMessageLength} chars`,
                  },
                ]}
              />

              {/* Initiation Rate Card */}
              {analysis.participant1.initiationRate !== undefined && (
                <ComparisonCard
                  title="Initiation Rate"
                  icon="🚀"
                  description={
                    (analysis.participant1.initiationRate ?? 0) > (analysis.participant2.initiationRate ?? 0)
                      ? `This indicates that ${analysis.participant1.name} starts conversations more often than ${analysis.participant2.name}, which may suggest a higher level of interest or eagerness to engage.`
                      : (analysis.participant2.initiationRate ?? 0) > (analysis.participant1.initiationRate ?? 0)
                      ? `This indicates that ${analysis.participant2.name} starts conversations more often than ${analysis.participant1.name}, which may suggest a higher level of interest or eagerness to engage.`
                      : `Both participants initiate conversations equally, indicating a balanced level of interest and engagement from both sides.`
                  }
                  participants={[
                    {
                      name: analysis.participant1.name,
                      value: `${analysis.participant1.initiationRate}%`,
                      progressValue: analysis.participant1.initiationRate,
                      progressColor: theme.colors.info,
                    },
                    {
                      name: analysis.participant2.name,
                      value: `${analysis.participant2.initiationRate ?? 0}%`,
                      progressValue: analysis.participant2.initiationRate ?? 0,
                      progressColor: theme.colors.error,
                    },
                  ]}
                />
              )}

              {/* Interest Level Card */}
              <ComparisonCard
                title="Interest Level"
                icon="❤️"
                description={
                  analysis.participant1.interestLevel > analysis.participant2.interestLevel
                    ? `${analysis.participant1.name} shows a higher overall engagement score (${analysis.participant1.interestLevel}%) compared to ${analysis.participant2.name} (${analysis.participant2.interestLevel}%), based on response time, message length, and frequency. This suggests ${analysis.participant1.name} may be more invested in the conversation.`
                    : analysis.participant2.interestLevel > analysis.participant1.interestLevel
                    ? `${analysis.participant2.name} shows a higher overall engagement score (${analysis.participant2.interestLevel}%) compared to ${analysis.participant1.name} (${analysis.participant1.interestLevel}%), based on response time, message length, and frequency. This suggests ${analysis.participant2.name} may be more invested in the conversation.`
                    : `Both participants show equal engagement levels (${analysis.participant1.interestLevel}%), indicating a balanced investment in the conversation from both sides.`
                }
                participants={[
                  {
                    name: analysis.participant1.name,
                    value: `${analysis.participant1.interestLevel}%`,
                    progressValue: analysis.participant1.interestLevel,
                    progressColor: theme.colors.info,
                  },
                  {
                    name: analysis.participant2.name,
                    value: `${analysis.participant2.interestLevel}%`,
                    progressValue: analysis.participant2.interestLevel,
                    progressColor: theme.colors.error,
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
                  badge={{ text: `${aiInsights.redFlags.count} Found`, color: theme.colors.error }}
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
                  badge={{ text: `${aiInsights.greenFlags.count} Found`, color: theme.colors.success }}
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

              {/* Compatibility Score */}
              {isInsightUnlocked('compatibilityScore') && aiInsights ? (
                <InsightCard
                  icon="💯"
                  title="Compatibility Score"
                  description={aiInsights.compatibilityScore.description}
                  items={aiInsights.compatibilityScore.items}
                  badge={{
                    text: `${aiInsights.compatibilityScore.percentage}% ${aiInsights.compatibilityScore.rating}`,
                    color: theme.colors.primary,
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

              {/* Love Language */}
              {isInsightUnlocked('loveLanguage') && aiInsights ? (
                <InsightCard
                  icon="❤️"
                  title="Love Language"
                  description={aiInsights.loveLanguage.description}
                  items={aiInsights.loveLanguage.items}
                  badge={{ text: aiInsights.loveLanguage.primary, color: theme.colors.error }}
                />
              ) : (
                <LockedInsightCard
                  icon="❤️"
                  title="Love Language"
                  onUnlock={() => handleUnlockInsight('loveLanguage')}
                  isLoading={loadingInsight === 'loveLanguage'}
                  unlockText="How do you show love?"
                />
              )}

              {/* "We" vs "I" Language */}
              {isInsightUnlocked('weVsIRatio') && aiInsights ? (
                <InsightCard
                  icon="👥"
                  title='"We" vs "I" Language'
                  description={aiInsights.weVsIRatio.description}
                  items={aiInsights.weVsIRatio.items}
                  badge={{ text: `${aiInsights.weVsIRatio.percentage}% "We"`, color: theme.colors.primary }}
                />
              ) : (
                <LockedInsightCard
                  icon="👥"
                  title='"We" vs "I" Language'
                  onUnlock={() => handleUnlockInsight('weVsIRatio')}
                  isLoading={loadingInsight === 'weVsIRatio'}
                  unlockText="How connected are you?"
                />
              )}

              {/* Shared Interests */}
              {isInsightUnlocked('sharedInterests') && aiInsights ? (
                <InsightCard
                  icon="🎯"
                  title="Shared Interests"
                  description={aiInsights.sharedInterests.description}
                  items={aiInsights.sharedInterests.items}
                  badge={{ text: `${aiInsights.sharedInterests.count} Found`, color: theme.colors.success }}
                />
              ) : (
                <LockedInsightCard
                  icon="🎯"
                  title="Shared Interests"
                  onUnlock={() => handleUnlockInsight('sharedInterests')}
                  isLoading={loadingInsight === 'sharedInterests'}
                  unlockText="What do you have in common?"
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
                    color: theme.colors.primary,
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

              {/* Attachment Style */}
              {isInsightUnlocked('attachmentStyle') && aiInsights ? (
                <InsightCard
                  icon="🔗"
                  title="Attachment Style"
                  description={aiInsights.attachmentStyle.description}
                  items={aiInsights.attachmentStyle.items}
                  badge={{ text: aiInsights.attachmentStyle.type, color: theme.colors.info }}
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

              {/* Compliments */}
              {isInsightUnlocked('compliments') && aiInsights ? (
                <InsightCard
                  icon="💐"
                  title="Compliments"
                  description={aiInsights.compliments.description}
                  items={aiInsights.compliments.items}
                  badge={{ text: getFrequencyLabel(aiInsights.compliments.count), color: theme.colors.success }}
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
                  badge={{ text: getFrequencyLabel(aiInsights.criticism.count), color: theme.colors.warning }}
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

              {/* Conflict Resolution */}
              {isInsightUnlocked('conflictResolution') && aiInsights ? (
                <InsightCard
                  icon="🤝"
                  title="Conflict Resolution"
                  description={aiInsights.conflictResolution.description}
                  items={aiInsights.conflictResolution.items}
                  badge={{ text: aiInsights.conflictResolution.type, color: theme.colors.info }}
                />
              ) : (
                <LockedInsightCard
                  icon="🤝"
                  title="Conflict Resolution"
                  onUnlock={() => handleUnlockInsight('conflictResolution')}
                  isLoading={loadingInsight === 'conflictResolution'}
                  unlockText="How do you handle disagreements?"
                />
              )}

              {/* Relationship Tips */}
              {isInsightUnlocked('relationshipTips') && aiInsights ? (
                <InsightCard
                  icon="💡"
                  title="Relationship Tips"
                  description={aiInsights.relationshipTips.description}
                  items={aiInsights.relationshipTips.tips}
                  badge={{ text: `${aiInsights.relationshipTips.count} Tips`, color: theme.colors.primary }}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
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
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsGrid: {
    marginTop: 12,
  },
  insightsContainer: {
    marginTop: 12,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
    letterSpacing: 0.1,
  },
})
