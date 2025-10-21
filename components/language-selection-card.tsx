import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import i18n, { getCurrentLocale, setLocale } from '@/i18n/config'

interface LanguageSelectionCardProps {
  onLanguageChange?: (locale: string) => void
}

const LANGUAGES = [
  { value: 'en', label: 'English', icon: 'check' as const },
  { value: 'it', label: 'Italiano', icon: 'check' as const },
]

export function LanguageSelectionCard({ onLanguageChange }: LanguageSelectionCardProps) {
  const theme = useTheme()
  const [currentLocale, setCurrentLocale] = useState(getCurrentLocale())

  const handleLanguageChange = (locale: string) => {
    setLocale(locale)
    setCurrentLocale(locale)

    if (onLanguageChange) {
      onLanguageChange(locale)
    }
  }

  return (
    <ThemedView
      style={[styles.card, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.colors.text }]}>{i18n.t('profile.changeLanguage')}</ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        {LANGUAGES.map((lang) => (
          <ThemedButton
            key={lang.value}
            title={lang.label}
            onPress={() => handleLanguageChange(lang.value)}
            variant={currentLocale === lang.value ? 'primary' : 'secondary'}
            size="medium"
            icon={currentLocale === lang.value ? lang.icon : undefined}
            iconPosition="right"
            fullWidth
          />
        ))}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
})
