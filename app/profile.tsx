import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DangerZoneCard } from '@/components/danger-zone-card'
import { LabelValueCard } from '@/components/label-value-card'
import { LanguageSelectionCard } from '@/components/language-selection-card'
import { LoadingScreen } from '@/components/loading-screen'
import { LoginCard } from '@/components/login-card'
import { PasswordChangeCard } from '@/components/password-change-card'
import { ScreenHeader } from '@/components/screen-header'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { useCustomAlert } from '@/hooks/ui/use-custom-alert'
import { useProfile } from '@/hooks/use-profile'
import i18n from '@/i18n/config'

export default function ProfileScreen() {
  const theme = useTheme()
  const { showAlert, AlertComponent } = useCustomAlert()
  const [, forceUpdate] = useState(0)

  const {
    email,
    isLoading,
    isAuthenticated,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    isLoggingIn,
    showPasswordChange,
    setShowPasswordChange,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isChangingPassword,
    handleLogin,
    handleChangePassword,
    handleLogout,
    handleDeleteAccount,
  } = useProfile({ onShowAlert: showAlert })

  const handleLanguageChange = () => {
    // Force re-render to update all translations
    forceUpdate((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingScreen icon="account" title="Loading Profile" subtitle="Please wait..." />
      </SafeAreaView>
    )
  }

  if (!isAuthenticated) {
    // Show login screen
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AlertComponent />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header with Back Button */}
            <ScreenHeader title="Login" style={styles.header} />

            {/* Login Form */}
            <LoginCard
              email={loginEmail}
              onEmailChange={setLoginEmail}
              password={loginPassword}
              onPasswordChange={setLoginPassword}
              onLogin={handleLogin}
              isLoading={isLoggingIn}
            />

            {/* Info Text */}
            <View style={styles.section}>
              <ThemedText style={[styles.infoText, { color: theme.colors.textTertiary }]}>
                Don&apos;t have an account? Create one after making a purchase to save your insights.
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AlertComponent />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Back Button */}
          <ScreenHeader title="My Profile" style={styles.header} />

          {/* Email Section */}
          <LabelValueCard icon="email-outline" label={i18n.t('common.email')} value={email} />

          {/* Language Selection */}
          <LanguageSelectionCard onLanguageChange={handleLanguageChange} />

          {/* Password Change Section */}
          <PasswordChangeCard
            showForm={showPasswordChange}
            onShowFormChange={setShowPasswordChange}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onChangePassword={handleChangePassword}
            isChanging={isChangingPassword}
          />

          {/* Logout Button */}
          <View style={styles.section}>
            <ThemedButton
              title="Logout"
              onPress={handleLogout}
              variant="secondary"
              size="large"
              icon="logout-variant"
              iconPosition="left"
              align="left"
              fullWidth
            />
          </View>

          {/* Delete Account Section */}
          <DangerZoneCard
            description="Permanently delete your account and all data. This cannot be undone."
            buttonText="Delete Account"
            onPress={handleDeleteAccount}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})
