import { StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { type DropdownOption, ThemedDropdown } from '@/components/themed-dropdown'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { useTranslation } from '@/hooks/use-translation'
import { setLocale } from '@/i18n/config'

const LANGUAGES: DropdownOption[] = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'it', label: '🇮🇹 Italiano' },
]

export function LanguageSelectionCard() {
  const theme = useTheme()
  const { t, locale } = useTranslation()

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale)
  }

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.backgroundLight,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="translate" size={20} color={theme.colors.primary} />
          <ThemedText style={[styles.label, { color: theme.colors.textTertiary }]}>
            {t('profile.changeLanguage')}
          </ThemedText>
        </View>

        <ThemedDropdown value={locale} options={LANGUAGES} onValueChange={handleLanguageChange} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
})
