import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const DEVICE_ID_KEY = 'device_id'

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  return `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Get or create a device ID for this device
 * This ID is used to identify the user for payment entitlements
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY)

    if (!deviceId) {
      // Generate and save new device ID
      deviceId = generateDeviceId()
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId)
      console.log('Generated new device ID:', deviceId)
    }

    return deviceId
  } catch (error) {
    console.error('Error getting device ID:', error)
    // Fallback: generate temporary ID (won't persist across app restarts)
    return generateDeviceId()
  }
}
