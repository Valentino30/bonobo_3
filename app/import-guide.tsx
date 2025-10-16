import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
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
          <View style={styles.platformBadgeContainer}>
            <View style={[styles.platformBadge, { backgroundColor: theme.colors.backgroundInfo, borderColor: theme.colors.primaryLighter }]}>
              <MaterialCommunityIcons name={isIOS ? 'apple' : 'android'} size={16} color={theme.colors.primary} />
              <ThemedText style={[styles.platformBadgeText, { color: theme.colors.primary }]}>Instructions for {isIOS ? 'iOS' : 'Android'}</ThemedText>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.darkOverlay }]}>Follow these steps:</ThemedText>

            {/* Step 1 */}
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={[styles.stepNumberText, { color: theme.colors.textWhite }]}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.colors.darkOverlay }]}>Open WhatsApp</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.colors.primaryDark }]}>Open the WhatsApp app</ThemedText>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={[styles.stepNumberText, { color: theme.colors.textWhite }]}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.colors.darkOverlay }]}>Open Chat</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.colors.primaryDark }]}>Enter the chat you want to analyze</ThemedText>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={[styles.stepNumberText, { color: theme.colors.textWhite }]}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.colors.darkOverlay }]}>Export Chat</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.colors.primaryDark }]}>
                  {isIOS
                    ? 'Tap on the contact or group name at the top of the chat, scroll all the way down and tap "Export Chat"'
                    : 'Tap the three dots (⋮) and select "More" → "Export Chat"'}
                </ThemedText>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={[styles.stepNumberText, { color: theme.colors.textWhite }]}>4</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.colors.darkOverlay }]}>Without Media</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.colors.primaryDark }]}>
                  Choose &quot;Without Media&quot; when prompted (media files are not needed for analysis)
                </ThemedText>
              </View>
            </View>

            {/* Step 5 */}
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={[styles.stepNumberText, { color: theme.colors.textWhite }]}>5</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.colors.darkOverlay }]}>Share to Bonobo</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.colors.primaryDark }]}>
                  Select &quot;Bonobo&quot; from the share menu to import the chat
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={[styles.privacySection, { backgroundColor: theme.colors.backgroundInfo, borderColor: theme.colors.primaryLighter }]}>
            <View style={styles.privacyHeader}>
              <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
              <ThemedText style={[styles.privacyTitle, { color: theme.colors.primary }]}>Your Privacy Matters</ThemedText>
            </View>
            <ThemedText style={[styles.privacyText, { color: theme.colors.primaryDark }]}>
              All chat data is stored securely on your device. We never upload your conversations to our servers. AI
              analysis is performed using encrypted requests.
            </ThemedText>
          </View>

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
  platformBadgeContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 6,
  },
  platformBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  stepsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  privacySection: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
})
