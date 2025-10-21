import { LogBox } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { StripeProvider } from '@stripe/stripe-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/theme-context'

// Ignore Stripe keep awake warning (known development mode issue)
LogBox.ignoreLogs(['No task registered for key StripeKeepJsAwakeTask', 'Unable to activate keep awake'])

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: 1,
    },
  },
})

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <NavigationThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="chats" options={{ headerShown: false }} />
              <Stack.Screen name="import-guide" options={{ headerShown: false }} />
              <Stack.Screen name="analysis/[chatId]" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" />
          </NavigationThemeProvider>
        </StripeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
