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
import { useTranslation } from '@/hooks/use-translation'

export default function ImportGuideScreen() {
  const isIOS = Platform.OS === 'ios'
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()

  const handleGotIt = () => {
    router.back()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundSuccessLight }]} edges={['top']}>
      <ThemedView style={[styles.content, { backgroundColor: theme.colors.backgroundSuccessLight }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <ThemedText style={[styles.title, { color: theme.colors.darkOverlay }]}>
              {t('importGuide.title')}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.colors.primary }]}>
              {t('importGuide.subtitle')}
            </ThemedText>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <ThemedText style={[styles.intro, { color: theme.colors.primaryAccent }]}>
              {t('importGuide.intro')}
            </ThemedText>
            <Badge
              icon="whatsapp"
              iconSize={20}
              iconColor="#25D366"
              text={t('importGuide.supportNote')}
              variant="success"
              containerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Platform Badge */}
          <Badge
            icon={isIOS ? 'apple' : 'android'}
            text={isIOS ? t('importGuide.platformIOS') : t('importGuide.platformAndroid')}
            variant="primary"
          />

          {/* Steps */}
          <StepList title={t('importGuide.followSteps')} steps={IMPORT_GUIDE_STEPS} />

          {/* Privacy Notice */}
          <InfoCard icon="shield-check" title={t('privacy.title')} description={t('privacy.message')} variant="info" />

          {/* CTA Button */}
          <View style={styles.ctaButtonContainer}>
            <ThemedButton
              title={t('common.gotIt')}
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
