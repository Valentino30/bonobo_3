import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { ThemedButton } from '@/components/themed-button'
import { EmailPasswordForm } from '@/components/email-password-form'
import { useTheme } from '@/contexts/theme-context'
import { useCustomAlert } from '@/hooks/use-custom-alert'
import { useAccountCreation } from '@/hooks/use-account-creation'

interface PaymentAuthScreenProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentAuthScreen({ visible, onClose, onSuccess }: PaymentAuthScreenProps) {
  const theme = useTheme()
  const { showAlert, AlertComponent } = useCustomAlert()

  const handleSuccess = () => {
    // Close modal and navigate back
    onSuccess()

    // Show confirmation with custom alert after navigation
    setTimeout(() => {
      showAlert(
        'Account Created Successfully!',
        'Your account has been created and your purchases have been securely linked to it.',
        [{ text: 'Great!' }]
      )
    }, 500)
  }

  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    setError,
    handleCreateAccount,
  } = useAccountCreation({
    onSuccess: handleSuccess,
  })

  // Helper to create onChange handler that clears errors
  const createOnChangeHandler = (setter: (value: string) => void) => (text: string) => {
    setter(text)
    setError(null)
  }

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
            <EmailPasswordForm
              email={email}
              onEmailChange={(text) => createOnChangeHandler(setEmail)(text.trim())}
              password={password}
              onPasswordChange={createOnChangeHandler(setPassword)}
              confirmPassword={confirmPassword}
              onConfirmPasswordChange={createOnChangeHandler(setConfirmPassword)}
              disabled={isLoading}
              variant="filled"
              showLabels
            />

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
