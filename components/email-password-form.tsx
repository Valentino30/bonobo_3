import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedTextInput } from '@/components/themed-text-input'
import type { TextInputSize, TextInputVariant } from '@/components/themed-text-input'
import { useTheme } from '@/contexts/theme-context'
import { useTranslation } from '@/hooks/use-translation'

interface EmailPasswordFormProps {
  email: string
  onEmailChange: (email: string) => void
  password: string
  onPasswordChange: (password: string) => void
  confirmPassword?: string
  onConfirmPasswordChange?: (password: string) => void
  disabled?: boolean
  size?: TextInputSize
  variant?: TextInputVariant
  showLabels?: boolean
}

/**
 * Reusable email/password form component
 * Supports optional password confirmation field and labels
 *
 * @example
 * // Simple login form
 * <EmailPasswordForm
 *   email={email}
 *   onEmailChange={setEmail}
 *   password={password}
 *   onPasswordChange={setPassword}
 * />
 *
 * @example
 * // Signup form with confirmation and labels
 * <EmailPasswordForm
 *   email={email}
 *   onEmailChange={setEmail}
 *   password={password}
 *   onPasswordChange={setPassword}
 *   confirmPassword={confirmPassword}
 *   onConfirmPasswordChange={setConfirmPassword}
 *   showLabels
 *   variant="filled"
 * />
 */
export function EmailPasswordForm({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  disabled = false,
  size = 'large',
  variant = 'default',
  showLabels = false,
}: EmailPasswordFormProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  const inputProps = {
    autoCapitalize: 'none' as const,
    autoCorrect: false,
    disabled,
    size,
    variant,
    fullWidth: true,
  }

  return (
    <View style={styles.container}>
      {showLabels ? (
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.colors.textDark }]}>{t('auth.emailLabel')}</ThemedText>
          <ThemedTextInput
            {...inputProps}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            icon="email-outline"
          />
        </View>
      ) : (
        <ThemedTextInput
          {...inputProps}
          placeholder={t('auth.emailLabel')}
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          icon="email-outline"
        />
      )}

      {showLabels ? (
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.colors.textDark }]}>{t('auth.passwordLabel')}</ThemedText>
          <ThemedTextInput
            {...inputProps}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={onPasswordChange}
            password
            icon="lock-outline"
          />
        </View>
      ) : (
        <ThemedTextInput
          {...inputProps}
          placeholder={t('auth.passwordLabel')}
          value={password}
          onChangeText={onPasswordChange}
          password
          icon="lock-outline"
        />
      )}

      {confirmPassword !== undefined &&
        onConfirmPasswordChange &&
        (showLabels ? (
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.colors.textDark }]}>
              {t('auth.confirmPasswordLabel')}
            </ThemedText>
            <ThemedTextInput
              {...inputProps}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              password
              icon="lock-check-outline"
            />
          </View>
        ) : (
          <ThemedTextInput
            {...inputProps}
            placeholder={t('auth.confirmPasswordLabel')}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            password
            icon="lock-check-outline"
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
})
