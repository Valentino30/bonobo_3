import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

// Custom storage adapter that securely persists Supabase auth tokens using encrypted storage.
// Uses SecureStore (iOS Keychain/Android Keystore) on mobile, localStorage on web.
// Without this, users would be logged out on every app restart.
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        return null
      }
      return localStorage.getItem(key)
    }
    const value = await SecureStore.getItemAsync(key)
    console.log('🔑 SecureStore getItem:', key, value ? 'has value' : 'null')
    return value
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value)
      }
      return
    }
    console.log('🔑 SecureStore setItem:', key, 'setting value')
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
      }
      return
    }
    console.log('🔑 SecureStore removeItem:', key)
    await SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
