import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { EmailPasswordForm } from '@/components/email-password-form'
import { InfoBanner } from '@/components/info-banner'
import { ModalHeader } from '@/components/modal-header'
import { ThemedButton } from '@/components/themed-button'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/contexts/theme-context'
import { useCustomAlert } from '@/hooks/ui/use-custom-alert'
import { useAccountCreation } from '@/hooks/use-account-creation'
import i18n from '@/i18n/config'

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
      showAlert(i18n.t('analysisErrors.accountCreatedTitle'), i18n.t('analysisErrors.accountCreatedSubtitle'), [
        { text: i18n.t('alerts.great') },
      ])
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
              <ModalHeader
                emoji="🔐"
                title={i18n.t('paywall.secureTitle')}
                subtitle={i18n.t('paywall.secureSubtitle')}
              />

              {error && <InfoBanner icon="alert-circle" text={error} variant="error" />}

              {/* Form */}
              <View style={styles.formContainer}>
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

                <InfoBanner icon="lock" text={i18n.t('privacy.dataSecure')} variant="success" />
              </View>

              {/* Create Account Button */}
              <ThemedButton
                title={i18n.t('auth.createAccountButton')}
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
    gap: 16,
  },
  formContainer: {
    gap: 16,
    marginBottom: 16,
  },
})
