import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'

interface LoadingScreenProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  title: string
  subtitle: string
}

export function LoadingScreen({ icon = 'database-search', title, subtitle }: LoadingScreenProps) {
  const [pulseAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim])

  return (
    <ThemedView style={styles.loadingContainer}>
      <ThemedView style={styles.loadingCard}>
        <Animated.View style={[styles.loadingIconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name={icon} size={48} color="#6B8E5A" />
        </Animated.View>
        <ThemedText style={styles.loadingTitle}>{title}</ThemedText>
        <ThemedText style={styles.loadingSubtitle}>{subtitle}</ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F9F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D5E3CE',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 24,
  },
})
