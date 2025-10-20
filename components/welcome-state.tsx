import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { useBounceAnimation } from '@/hooks/use-bounce-animation'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Animated, StyleSheet } from 'react-native'

export function WelcomeState() {
  const theme = useTheme()
  const bounceAnim = useBounceAnimation()

  return (
    <ThemedView style={styles.welcomeState}>
      <ThemedView
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background, borderColor: theme.colors.backgroundSecondary },
        ]}
      >
        <ThemedText style={styles.icon}>🤗</ThemedText>
      </ThemedView>
      <ThemedText style={[styles.title, { color: theme.colors.text }]}>Welcome to Bonobo!</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        We&apos;re here to help you improve your relationships through AI-powered insights.
      </ThemedText>

      <Animated.View style={[styles.arrowContainer, { transform: [{ translateY: bounceAnim }] }]}>
        <MaterialCommunityIcons name="arrow-down" size={48} color={theme.colors.primary} />
      </Animated.View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  welcomeState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 140,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    overflow: 'visible',
  },
  icon: {
    fontSize: 56,
    opacity: 0.9,
    lineHeight: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    letterSpacing: 0.2,
    paddingHorizontal: 10,
  },
  arrowContainer: {
    marginTop: 20,
    alignItems: 'center',
    opacity: 0.8,
  },
})
