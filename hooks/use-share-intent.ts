import { ShareIntentData } from '@/types/share-intent'
import { useShareIntent as useExpoShareIntent } from 'expo-share-intent'
import { useEffect, useState } from 'react'

export function useShareIntent() {
  const [shareData, setShareData] = useState<ShareIntentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { hasShareIntent, shareIntent, resetShareIntent, error } = useExpoShareIntent({
    debug: true,
    resetOnBackground: true,
  })

  useEffect(() => {
    const handleShareIntent = () => {
      if (hasShareIntent && shareIntent) {
        console.log('Share intent received:', shareIntent)

        // Convert expo-share-intent format to our format
        const convertedData: ShareIntentData = {
          text: shareIntent.text || '',
          type: shareIntent.type || '',
          webUrl: shareIntent.webUrl || '',
          files: shareIntent.files?.map((file) => file.path || file.fileName || '') || [],
        }

        setShareData(convertedData)
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
