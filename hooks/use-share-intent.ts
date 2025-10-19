import { ShareIntentData } from '@/types/share-intent'
import { useShareIntent as useExpoShareIntent } from 'expo-share-intent'
import { useEffect, useRef, useState } from 'react'

export function useShareIntent() {
  const [shareData, setShareData] = useState<ShareIntentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const lastProcessedIntentRef = useRef<string | null>(null)

  const { hasShareIntent, shareIntent, resetShareIntent, error } = useExpoShareIntent({
    debug: true,
    resetOnBackground: true,
  })

  useEffect(() => {
    const handleShareIntent = () => {
      if (hasShareIntent && shareIntent) {
        // Create a hash of the share intent to prevent duplicate processing
        const intentHash = JSON.stringify({
          text: shareIntent.text?.substring(0, 100),
          type: shareIntent.type,
          filesCount: shareIntent.files?.length || 0,
        })

        // Only process if this is a new intent
        if (lastProcessedIntentRef.current === intentHash) {
          console.log('⏭️  Share intent already processed, skipping...')
          return
        }

        console.log('Share intent received:', shareIntent)
        lastProcessedIntentRef.current = intentHash

        // Convert expo-share-intent format to our format
        const convertedData: ShareIntentData = {
          text: shareIntent.text || '',
          type: shareIntent.type || '',
          webUrl: shareIntent.webUrl || '',
          files: shareIntent.files?.map((file) => file.path || file.fileName || '') || [],
        }

        setShareData(convertedData)
      } else if (!hasShareIntent) {
        // Reset when share intent is cleared
        lastProcessedIntentRef.current = null
      }
      setIsLoading(false)
    }

    handleShareIntent()
  }, [hasShareIntent, shareIntent])

  useEffect(() => {
    if (error) {
      console.error('Share intent error:', error)
      setIsLoading(false)
    }
  }, [error])

  const clearShareData = () => {
    setShareData(null)
    resetShareIntent()
  }

  return {
    shareData,
    isLoading,
    clearShareData,
    hasShareData: !!shareData,
  }
}
