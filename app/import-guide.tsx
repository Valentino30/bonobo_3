import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ImportGuideScreen() {
  const isIOS = Platform.OS === 'ios'
  const router = useRouter()

  const handleGotIt = () => {
    router.back()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <ThemedText style={styles.title}>How to Import</ThemedText>
            <ThemedText style={styles.subtitle}>WhatsApp Chat Export Guide</ThemedText>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <ThemedText style={styles.intro}>
              Import your WhatsApp conversation to analyze your relationship dynamics and communication patterns.
            </ThemedText>
            <View style={styles.supportedPlatforms}>
              <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
              <ThemedText style={styles.supportedText}>Currently supporting WhatsApp only</ThemedText>
            </View>
          </View>

          {/* Platform Badge */}
          <View style={styles.platformBadgeContainer}>
            <View style={styles.platformBadge}>
              <MaterialCommunityIcons name={isIOS ? 'apple' : 'android'} size={16} color="#6B8E5A" />
              <ThemedText style={styles.platformBadgeText}>Instructions for {isIOS ? 'iOS' : 'Android'}</ThemedText>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <ThemedText style={styles.sectionTitle}>Follow these steps:</ThemedText>

            {/* Step 1 */}
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Open WhatsApp</ThemedText>
                <ThemedText style={styles.stepDescription}>Open the WhatsApp app</ThemedText>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Open Chat</ThemedText>
                <ThemedText style={styles.stepDescription}>Enter the chat you want to analyze</ThemedText>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Export Chat</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  {isIOS
                    ? 'Tap on the contact or group name at the top of the chat, scroll all the way down and tap "Export Chat"'
                    : 'Tap the three dots (⋮) and select "More" → "Export Chat"'}
                </ThemedText>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>4</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Without Media</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Choose &quot;Without Media&quot; when prompted (media files are not needed for analysis)
                </ThemedText>
              </View>
            </View>

            {/* Step 5 */}
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>5</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Share to Bonobo</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Select &quot;Bonobo&quot; from the share menu to import the chat
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacySection}>
            <View style={styles.privacyHeader}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#6B8E5A" />
              <ThemedText style={styles.privacyTitle}>Your Privacy Matters</ThemedText>
            </View>
            <ThemedText style={styles.privacyText}>
              All chat data is stored securely on your device. We never upload your conversations to our servers. AI
              analysis is performed using encrypted requests.
            </ThemedText>
          </View>

          {/* CTA Button */}
          <View style={styles.ctaButtonContainer}>
            <TouchableOpacity style={styles.ctaButton} onPress={handleGotIt} activeOpacity={0.85}>
              <ThemedText style={styles.ctaButtonText}>GOT IT</ThemedText>
              <MaterialCommunityIcons name="thumb-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF6',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FBF6',
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
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B8E5A',
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
    color: '#4A5D42',
    textAlign: 'center',
    marginBottom: 16,
  },
  supportedPlatforms: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 8,
  },
  supportedText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  platformBadgeContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5E3CE',
    alignSelf: 'center',
    gap: 6,
  },
  platformBadgeText: {
    fontSize: 13,
    color: '#6B8E5A',
    fontWeight: '500',
  },
  stepsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
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
    backgroundColor: '#6B8E5A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5C6B63',
  },
  privacySection: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F9F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E3CE',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B8E5A',
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5C6B63',
  },
  ctaButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#6B8E5A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
})
