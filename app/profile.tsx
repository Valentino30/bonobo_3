import { useCustomAlert } from '@/components/custom-alert'
import { LabelValueCard } from '@/components/label-value-card'
import { LoadingScreen } from '@/components/loading-screen'
import { PasswordChangeCard } from '@/components/password-change-card'
import { ScreenHeader } from '@/components/screen-header'
import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedTextInput } from '@/components/themed-text-input'
import { useTheme } from '@/contexts/theme-context'
import { useProfile } from '@/hooks/use-profile'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  const theme = useTheme()
  const { showAlert, AlertComponent } = useCustomAlert()

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
            <View style={styles.section}>
              <View
                style={[
                  styles.loginCard,
                  { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border },
                ]}
              >
                <View style={[styles.loginHeader, { borderBottomColor: theme.colors.borderLight }]}>
                  <MaterialCommunityIcons name="login-variant" size={18} color={theme.colors.primary} />
                  <ThemedText style={[styles.loginHeaderText, { color: theme.colors.text }]}>Welcome Back</ThemedText>
                </View>

                <View style={styles.loginForm}>
                  {/* Email Input */}
                  <ThemedTextInput
                    placeholder="Email address"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
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
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    password
                    icon="lock-outline"
                    size="large"
                    fullWidth
                  />

                  {/* Login Button */}
                  <ThemedButton
                    title="Login"
                    onPress={handleLogin}
                    variant="primary"
                    size="large"
                    loading={isLoggingIn}
                    disabled={isLoggingIn}
                    fullWidth
                  />
                </View>
              </View>
            </View>

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
          <LabelValueCard icon="email-outline" label="Email" value={email} />

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
          <View style={styles.section}>
            <View
              style={[
                styles.dangerCard,
                { backgroundColor: theme.colors.backgroundDanger, borderColor: theme.colors.borderDanger },
              ]}
            >
              <View style={styles.dangerHeader}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.colors.textDanger} />
                <ThemedText style={[styles.dangerTitle, { color: theme.colors.textDanger }]}>Danger Zone</ThemedText>
              </View>
              <ThemedText style={[styles.dangerDescription, { color: theme.colors.textSecondary }]}>
                Permanently delete your account and all data. This cannot be undone.
              </ThemedText>
              <ThemedButton
                title="Delete Account"
                onPress={handleDeleteAccount}
                variant="destructive"
                size="medium"
                fullWidth
              />
            </View>
          </View>
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
  dangerCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})
