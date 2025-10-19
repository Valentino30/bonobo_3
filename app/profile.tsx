import { useCustomAlert } from '@/components/custom-alert'
import { LoadingScreen } from '@/components/loading-screen'
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
          <View style={styles.section}>
            <View
              style={[styles.card, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.primary} />
                <ThemedText style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>Email</ThemedText>
              </View>
              <ThemedText style={[styles.cardValue, { color: theme.colors.text }]}>{email}</ThemedText>
            </View>
          </View>

          {/* Password Change Section */}
          <View style={styles.section}>
            {!showPasswordChange ? (
              <ThemedButton
                title="Change Password"
                onPress={() => setShowPasswordChange(true)}
                variant="secondary"
                size="large"
                icon="lock-outline"
                iconPosition="left"
                align="left"
                fullWidth
              />
            ) : (
              <View
                style={[
                  styles.passwordCard,
                  { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border },
                ]}
              >
                <View style={[styles.passwordHeader, { borderBottomColor: theme.colors.borderLight }]}>
                  <MaterialCommunityIcons name="lock-outline" size={18} color={theme.colors.primary} />
                  <ThemedText style={[styles.passwordHeaderText, { color: theme.colors.text }]}>
                    Update Password
                  </ThemedText>
                </View>

                <View style={styles.passwordForm}>
                  {/* New Password */}
                  <ThemedTextInput
                    placeholder="New password (min. 8 characters)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    password
                    icon="lock-outline"
                    fullWidth
                  />

                  {/* Confirm Password */}
                  <ThemedTextInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    password
                    icon="lock-check-outline"
                    fullWidth
                  />

                  {/* Buttons */}
                  <View style={styles.passwordButtons}>
                    <ThemedButton
                      title="Cancel"
                      onPress={() => {
                        setShowPasswordChange(false)
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      variant="secondary"
                      size="medium"
                      disabled={isChangingPassword}
                      style={{ flex: 1 }}
                    />
                    <ThemedButton
                      title="Update"
                      onPress={handleChangePassword}
                      variant="primary"
                      size="medium"
                      loading={isChangingPassword}
                      disabled={isChangingPassword}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

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
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '400',
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
  passwordCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  passwordHeaderText: {
    fontSize: 16,
    fontWeight: '400',
  },
  passwordForm: {
    gap: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
