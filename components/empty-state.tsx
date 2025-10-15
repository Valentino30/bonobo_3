import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

interface EmptyStateProps {
  hasShareData: boolean
  showPlatform: string
  manualInput: string
  setManualInput: (text: string) => void
  onManualImport: () => void
  onClearShareData?: () => void
}

export function EmptyState({
  hasShareData,
  showPlatform,
  manualInput,
  setManualInput,
  onManualImport,
  onClearShareData,
}: EmptyStateProps) {
  const theme = useTheme()
  const bounceAnim = useRef(new Animated.Value(0)).current

  // Bouncing animation for the arrow
  useEffect(() => {
    if (!hasShareData) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }, [hasShareData, bounceAnim])

  return (
    <ThemedView style={styles.emptyState}>
      <ThemedView style={[styles.emptyIconContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.backgroundSecondary }]}>
        <ThemedText style={styles.emptyIcon}>🤗</ThemedText>
      </ThemedView>
      <ThemedText style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {hasShareData ? 'Loading Your Chat' : 'Welcome to Bonobo!'}
      </ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {hasShareData
          ? 'Please wait while we import your WhatsApp chat'
          : "We're here to help you improve your relationships through AI-powered insights."}
      </ThemedText>

      {!hasShareData && (
        <Animated.View style={[styles.arrowContainer, { transform: [{ translateY: bounceAnim }] }]}>
          <MaterialCommunityIcons name="arrow-down" size={48} color={theme.colors.primary} />
        </Animated.View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 140,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    overflow: 'visible',
  },
  emptyIcon: {
    fontSize: 56,
    opacity: 0.9,
    lineHeight: 64,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    paddingHorizontal: 10,
  },
  emptySubtitle: {
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
