import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedTextInput } from '@/components/themed-text-input'
import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

interface LoginCardProps {
  email: string
  onEmailChange: (email: string) => void
  password: string
  onPasswordChange: (password: string) => void
  onLogin: () => void
  isLoading?: boolean
  title?: string
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  buttonText?: string
  style?: StyleProp<ViewStyle>
}

/**
 * Reusable login card with email/password form.
 * Uses controlled component pattern - parent manages all state.
 *
 * @example
 * <LoginCard
 *   email={loginEmail}
 *   onEmailChange={setLoginEmail}
 *   password={loginPassword}
 *   onPasswordChange={setLoginPassword}
 *   onLogin={handleLogin}
 *   isLoading={isLoggingIn}
 * />
 */
export function LoginCard({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onLogin,
  isLoading = false,
  title = 'Welcome Back',
  icon = 'login-variant',
  buttonText = 'Login',
  style,
}: LoginCardProps) {
  const theme = useTheme()

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.loginCard,
          {
            backgroundColor: theme.colors.backgroundLight,
            borderColor: theme.colors.border,
          },
          style,
        ]}
      >
        <View style={[styles.loginHeader, { borderBottomColor: theme.colors.borderLight }]}>
          <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
          <ThemedText style={[styles.loginHeaderText, { color: theme.colors.text }]}>{title}</ThemedText>
        </View>

        <View style={styles.loginForm}>
          {/* Email Input */}
          <ThemedTextInput
            placeholder="Email address"
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            icon="email-outline"
            size="large"
            fullWidth
          />

          {/* Password Input */}
          <ThemedTextInput
            placeholder="Password"
            value={password}
            onChangeText={onPasswordChange}
            autoCapitalize="none"
            autoCorrect={false}
            password
            icon="lock-outline"
            size="large"
            fullWidth
          />

          {/* Login Button */}
          <ThemedButton
            title={buttonText}
            onPress={onLogin}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  loginCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  loginHeaderText: {
    fontSize: 16,
    fontWeight: '400',
  },
  loginForm: {
    gap: 16,
  },
})
