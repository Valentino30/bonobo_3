import { ShareIntentData } from '@/types/share-intent'
import * as Linking from 'expo-linking'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

export function useShareIntent() {
  const [shareData, setShareData] = useState<ShareIntentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleInitialIntent = async () => {
      if (Platform.OS === 'android') {
        try {
          // Check if the app was opened with a URL that contains share data
          const initialURL = await Linking.getInitialURL()

          if (initialURL) {
            // Parse the URL for share data
            console.log('Initial URL:', initialURL)
            // For now, we'll just log this - in a real implementation,
            // you'd parse the URL or use a native module to get intent data
          }

          console.log('Checking for share intent...')

          // Placeholder for share intent data
          // In a real implementation, this would get data from the native side
        } catch (error) {
          console.error('Error handling initial intent:', error)
        }
      }
      setIsLoading(false)
    }

    const handleURL = (event: { url: string }) => {
      console.log('Received URL:', event.url)
      // Handle deep links that might contain share data
    }

    // Listen for URL events
    const subscription = Linking.addEventListener('url', handleURL)

    handleInitialIntent()

    return () => {
      subscription?.remove()
    }
  }, [])

  const clearShareData = () => {
    setShareData(null)
  }

  return {
    shareData,
    isLoading,
    clearShareData,
    hasShareData: !!shareData,
  }
}
