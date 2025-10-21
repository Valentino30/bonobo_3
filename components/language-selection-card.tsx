import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import i18n, { getCurrentLocale, setLocale } from '@/i18n/config'

interface LanguageSelectionCardProps {
  onLanguageChange?: (locale: string) => void
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
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

      <View
        style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
      >
        <Picker
          selectedValue={currentLocale}
          onValueChange={handleLanguageChange}
          style={[styles.picker, { color: theme.colors.text }]}
          dropdownIconColor={theme.colors.text}
        >
          {LANGUAGES.map((lang) => (
            <Picker.Item key={lang.value} label={lang.label} value={lang.value} color={theme.colors.text} />
          ))}
        </Picker>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
})
