import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { StripeProvider } from '@stripe/stripe-react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="chats" options={{ headerShown: false }} />
          <Stack.Screen name="import-guide" options={{ headerShown: false }} />
          <Stack.Screen name="analysis/[chatId]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </StripeProvider>
  )
}
