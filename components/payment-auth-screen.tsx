import { useState, useEffect } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
import { ThemedIconButton } from '@/components/themed-icon-button'
import { useTheme } from '@/contexts/theme-context'
import { AuthService } from '@/utils/auth-service'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCustomAlert } from '@/components/custom-alert'

interface PaymentAuthScreenProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentAuthScreen({ visible, onClose, onSuccess }: PaymentAuthScreenProps) {
  const theme = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showAlert, AlertComponent } = useCustomAlert()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    // Minimum 8 characters
    return password.length >= 8
  }

  const handleCreateAccount = async () => {
    setError(null)

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      // Create the account - Supabase will handle duplicate email errors
      const result = await AuthService.signUpWithEmail(email, password)

      if (!result.success) {
        setError(result.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Success! Log the result
      console.log('✅ Account creation result:', {
        success: result.success,
        hasUser: !!result.user,
        hasSession: !!result.session,
        userId: result.user?.id,
        userEmail: result.user?.email,
      })

      // Check if session was created (email confirmation may be required)
      if (!result.session) {
        console.warn('⚠️ No session created - email confirmation required')
        setError('Account created but email confirmation is required. Please check your email and then login.')
        setIsLoading(false)
        return
      }

      // Clear form and close modal first
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Call onSuccess to close modal and navigate back
      onSuccess()

      // Show confirmation with custom alert after navigation
      setTimeout(() => {
        showAlert(
          'Account Created Successfully!',
          'Your account has been created and your purchases have been securely linked to it.',
          [{ text: 'Great!' }]
        )
      }, 500)
    } catch (error) {
      console.error('Account creation error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }


  // Debug log when modal visibility changes
  useEffect(() => {
    console.log('PaymentAuthScreen visible:', visible)
  }, [visible])

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.backgroundOverlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ThemedView style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}>
            {/* Custom Alert */}
            <AlertComponent />

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              keyboardShouldPersistTaps="handled"
            >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🔐</Text>
              <ThemedText type="title" style={styles.title}>
                Secure Your Purchase
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Create an account to access your insights from any device and keep your purchases safe
              </ThemedText>
            </View>

            {/* Error Message */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.backgroundError }]}>
                <Text style={[styles.errorText, { color: theme.colors.textDanger }]}>{error}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.colors.textDark }]}>Email Address</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundInput, borderColor: theme.colors.borderInput, color: theme.colors.text }]}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text.trim())
                    setError(null)
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.colors.textDark }]}>Password</ThemedText>
                <View style={[styles.passwordContainer, { backgroundColor: theme.colors.backgroundInput, borderColor: theme.colors.borderInput }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: theme.colors.text }]}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      setError(null)
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <ThemedIconButton
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword(!showPassword)}
                    variant="primary"
                    size="medium"
                    style={styles.showPasswordButton}
                  />
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.colors.textDark }]}>Confirm Password</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.backgroundInput, borderColor: theme.colors.borderInput, color: theme.colors.text }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    setError(null)
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Privacy Notice */}
            <View style={[styles.privacyNotice, { backgroundColor: theme.colors.backgroundSuccess }]}>
              <Text style={styles.lockIcon}>🔒</Text>
              <ThemedText style={[styles.privacyText, { color: theme.colors.textSuccess }]}>
                Your data is private and secure. We only use your email to help you access your account.
              </ThemedText>
            </View>

            {/* Create Account Button */}
            <ThemedButton
              title="Create Account & Continue"
              onPress={handleCreateAccount}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            />
          </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
    maxHeight: '95%',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 60 : 80,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 16,
  },
  privacyNotice: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  privacyText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
})
