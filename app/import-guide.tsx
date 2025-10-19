import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
import { StepList, Step } from '@/components/step-list'
import { InfoCard } from '@/components/info-card'
import { Badge } from '@/components/badge'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'

export default function ImportGuideScreen() {
  const theme = useTheme()
  const isIOS = Platform.OS === 'ios'
  const router = useRouter()

  const handleGotIt = () => {
    router.back()
  }

  const steps: Step[] = [
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundSuccessLight }]} edges={['top']}>
      <ThemedView style={[styles.content, { backgroundColor: theme.colors.backgroundSuccessLight }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <ThemedText style={[styles.title, { color: theme.colors.darkOverlay }]}>How to Import</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.colors.primary }]}>WhatsApp Chat Export Guide</ThemedText>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <ThemedText style={[styles.intro, { color: theme.colors.primaryAccent }]}>
              Import your WhatsApp conversation to analyze your relationship dynamics and communication patterns.
            </ThemedText>
            <View style={[styles.supportedPlatforms, { backgroundColor: theme.colors.backgroundSuccess }]}>
              <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
              <ThemedText style={[styles.supportedText, { color: theme.colors.successDark }]}>Currently supporting WhatsApp only</ThemedText>
            </View>
          </View>

          {/* Platform Badge */}
          <Badge
            icon={isIOS ? 'apple' : 'android'}
            text={`Instructions for ${isIOS ? 'iOS' : 'Android'}`}
            variant="primary"
          />

          {/* Steps */}
          <StepList title="Follow these steps:" steps={steps} />

          {/* Privacy Notice */}
          <InfoCard
            icon="shield-check"
            title="Your Privacy Matters"
            description="All chat data is stored securely on your device. We never upload your conversations to our servers. AI analysis is performed using encrypted requests."
            variant="info"
          />

          {/* CTA Button */}
          <View style={styles.ctaButtonContainer}>
            <ThemedButton
              title="GOT IT"
              onPress={handleGotIt}
              variant="primary"
              size="large"
              icon="thumb-up"
              iconPosition="right"
              shadow
              fullWidth
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportedPlatforms: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 8,
  },
  supportedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ctaButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
})
