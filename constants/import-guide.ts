import { Platform } from 'react-native'
import { Step } from '@/components/step-list'

const isIOS = Platform.OS === 'ios'

export const IMPORT_GUIDE_STEPS: Step[] = [
  {
    title: 'Open WhatsApp',
    description: 'Open the WhatsApp app',
  },
  {
    title: 'Open Chat',
    description: 'Enter the chat you want to analyze',
  },
  {
    title: 'Export Chat',
    description: isIOS
      ? 'Tap on the contact or group name at the top of the chat, scroll all the way down and tap "Export Chat"'
      : 'Tap the three dots (⋮) and select "More" → "Export Chat"',
  },
  {
    title: 'Without Media',
    description: 'Choose "Without Media" when prompted (media files are not needed for analysis)',
  },
  {
    title: 'Share to Bonobo',
    description: 'Select "Bonobo" from the share menu to import the chat',
  },
]
