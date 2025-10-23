import { useState } from 'react'
import { useUnlockInsightMutation } from '@/hooks/queries/use-analysis-query'
import i18n from '@/i18n/config'
import type { ChatAnalysisData } from './use-chat-analysis'

type UseInsightUnlockOptions = {
  chatId: string
  chat: { text: string; unlockedInsights?: string[] } | null
  analysis: ChatAnalysisData | null
  showAlert: (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => void
  onNoAccess: () => void
}

/**
 * Hook for managing insight unlocking logic
 */
export function useInsightUnlock({ chatId, chat, analysis, showAlert, onNoAccess }: UseInsightUnlockOptions) {
  const [pendingInsightToUnlock, setPendingInsightToUnlock] = useState<string | null>(null)

  const unlockInsightMutation = useUnlockInsightMutation()

  // Derived state
  const unlockedInsights = new Set(chat?.unlockedInsights || [])
  const loadingInsight = unlockInsightMutation.isPending ? pendingInsightToUnlock : null

  // Helper: Check if an insight is unlocked
  const isInsightUnlocked = (insightId: string): boolean => {
    return unlockedInsights.has(insightId)
  }

  // Handler: Unlock insight
  const handleUnlockInsight = async (insightId: string) => {
    if (!chat || !analysis) return

    setPendingInsightToUnlock(insightId)

    try {
      await unlockInsightMutation.mutateAsync({
        chatId,
        insightId,
        chatText: chat.text,
        analysis,
      })
      // Mutation handles persistence to Supabase in onSuccess
      setPendingInsightToUnlock(null)
    } catch (error: any) {
      if (error.message === 'NO_ACCESS') {
        // Keep the insight pending so it can be unlocked after purchase
        onNoAccess()
      } else {
        showAlert(i18n.t('analysisErrors.failedToUnlock'), i18n.t('analysisErrors.failedToUnlockMessage'))
        setPendingInsightToUnlock(null)
      }
    }
  }

  return {
    handleUnlockInsight,
    isInsightUnlocked,
    loadingInsight,
    pendingInsightToUnlock,
    setPendingInsightToUnlock,
    unlockedInsights,
  }
}
