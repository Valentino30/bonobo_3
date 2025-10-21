import { useState } from 'react'
import { type AIInsights, analyzeChat } from '@/utils/ai-service'
import { PaymentService } from '@/utils/payment-service'

type UseUnlockInsightOptions = {
  chatId: string
  chatText: string
  aiInsights: AIInsights | null
  unlockedInsights: Set<string>
  analysis: any
  setAiInsights: (insights: AIInsights) => void
  setUnlockedInsights: (insights: Set<string>) => void
  updateChatAnalysis: (
    chatId: string,
    analysis: any,
    aiInsights?: AIInsights,
    unlockedInsights?: string[]
  ) => Promise<void>
  showAlert: (title: string, message: string) => void
  onShowPaywall: () => void
}

export function useUnlockInsight(options: UseUnlockInsightOptions) {
  const {
    chatId,
    chatText,
    aiInsights,
    unlockedInsights,
    analysis,
    setAiInsights,
    setUnlockedInsights,
    updateChatAnalysis,
    showAlert,
    onShowPaywall,
  } = options

  const [loadingInsight, setLoadingInsight] = useState<string | null>(null)

  const handleUnlockInsight = async (insightId: string) => {
    // First access check - show paywall if no access
    const access = await PaymentService.hasAccess(chatId)

    if (!access) {
      onShowPaywall()
      return
    }

    // Has access - unlock this specific insight
    if (unlockedInsights.has(insightId)) {
      return
    }

    setLoadingInsight(insightId)

    try {
      // Triple-check access
      const reconfirmAccess = await PaymentService.hasAccess(chatId)

      if (!reconfirmAccess) {
        setLoadingInsight(null)
        onShowPaywall()
        showAlert('Access Required', 'Please complete payment to unlock insights')
        return
      }

      // Generate AI insights if needed
      let insights = aiInsights
      if (!aiInsights) {
        insights = await analyzeChat(chatText)
        setAiInsights(insights)

        // Assign one-time purchase to chat (skip for subscriptions)
        const hasSubscription = await PaymentService.hasActiveSubscription()
        if (!hasSubscription) {
          try {
            await PaymentService.assignAnalysisToChat(chatId)
          } catch (assignError) {
            setLoadingInsight(null)
            onShowPaywall()
            showAlert(
              'Payment Verification Failed',
              'Could not verify your payment. Please try again or contact support.'
            )
            return
          }
        }
      }

      // Final verification
      const finalAccessCheck = await PaymentService.hasAccess(chatId)
      if (!finalAccessCheck) {
        setLoadingInsight(null)
        onShowPaywall()
        showAlert('Access Verification Failed', 'Could not verify access. Please try again.')
        return
      }

      // Mark insight as unlocked and persist
      const newUnlockedInsights = new Set([...unlockedInsights, insightId])
      setUnlockedInsights(newUnlockedInsights)

      // Save to storage
      if (analysis) {
        await updateChatAnalysis(chatId, analysis, insights || undefined, Array.from(newUnlockedInsights))
      }
    } catch (err) {
      showAlert(
        'Failed to Unlock Insight',
        "Don't worry, this can happen sometimes due to the AI being overloaded. Simply try again in a few seconds."
      )
    } finally {
      setLoadingInsight(null)
    }
  }

  return {
    loadingInsight,
    handleUnlockInsight,
  }
}
