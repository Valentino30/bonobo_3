import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Badge } from '@/components/badge'
import { InfoCard } from '@/components/info-card'
import { StepList } from '@/components/step-list'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IMPORT_GUIDE_STEPS } from '@/constants/import-guide'
import { useTheme } from '@/contexts/theme-context'

export default function ImportGuideScreen() {
  const isIOS = Platform.OS === 'ios'
  const router = useRouter()
  const theme = useTheme()

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
            <ThemedText style={[styles.subtitle, { color: theme.colors.primary }]}>
              WhatsApp Chat Export Guide
            </ThemedText>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <ThemedText style={[styles.intro, { color: theme.colors.primaryAccent }]}>
              Import your WhatsApp conversation to analyze your relationship dynamics and communication patterns.
            </ThemedText>
            <Badge
              icon="whatsapp"
              iconSize={20}
              iconColor="#25D366"
              text="Currently supporting WhatsApp only"
              variant="success"
              containerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Platform Badge */}
          <Badge
            icon={isIOS ? 'apple' : 'android'}
            text={`Instructions for ${isIOS ? 'iOS' : 'Android'}`}
            variant="primary"
          />

          {/* Steps */}
          <StepList title="Follow these steps:" steps={IMPORT_GUIDE_STEPS} />

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
  ctaButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
})
