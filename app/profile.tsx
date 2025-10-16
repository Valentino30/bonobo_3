import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { ThemedButton } from '@/components/themed-button'
import { ThemedIconButton } from '@/components/themed-icon-button'
import { LoadingScreen } from '@/components/loading-screen'
import { AuthService } from '@/utils/auth-service'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCustomAlert } from '@/components/custom-alert'
import { useTheme } from '@/contexts/theme-context'

export default function ProfileScreen() {
  const theme = useTheme()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { showAlert, AlertComponent } = useCustomAlert()

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Load user profile
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    const user = await AuthService.getCurrentUser()

    if (!user || !user.email) {
      // Not authenticated - show login screen
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    setEmail(user.email)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showAlert('Missing Information', 'Please enter your email and password', [{ text: 'OK' }])
      return
    }

    setIsLoggingIn(true)

    const result = await AuthService.signInWithEmail(loginEmail, loginPassword)

    setIsLoggingIn(false)

    if (result.success) {
      // Successfully logged in - redirect to chats and force reload
      router.replace('/chats?reload=true')
    } else {
      showAlert('Login Failed', result.error || 'Failed to login', [{ text: 'OK' }])
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert('Missing Information', 'Please fill in all password fields', [{ text: 'OK' }])
      return
    }

    if (newPassword.length < 8) {
      showAlert('Password Too Short', 'Password must be at least 8 characters', [{ text: 'OK' }])
      return
    }

    if (newPassword !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match', [{ text: 'OK' }])
      return
    }

    setIsChangingPassword(true)

    const result = await AuthService.updatePassword(newPassword)

    setIsChangingPassword(false)

    if (result.success) {
      showAlert('Password Updated', 'Your password has been updated successfully', [{ text: 'Great!' }])
      setShowPasswordChange(false)
      setNewPassword('')
      setConfirmPassword('')
    } else {
      showAlert('Update Failed', result.error || 'Failed to update password', [{ text: 'OK' }])
    }
  }

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          const result = await AuthService.signOut()
          if (result.success) {
            // Redirect to chats and force reload (will show empty state since user logged out)
            router.replace('/chats?reload=true')
          } else {
            showAlert('Error', result.error || 'Failed to logout', [{ text: 'OK' }])
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    showAlert(
      'Delete Account',
      'This will permanently delete your account and ALL associated data including chats, purchases, and insights. This action CANNOT be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: () => {
            // Add delay before showing second confirmation to allow first alert to close
            setTimeout(() => {
              showAlert(
                'Are You Absolutely Sure?',
                'This is your last chance to cancel. All your data will be permanently deleted.',
                [
                  { text: 'Cancel' },
                  {
                    text: 'Delete Everything',
                    onPress: async () => {
                      setIsLoading(true)
                      const result = await AuthService.deleteAccount()
                      setIsLoading(false)

                      if (result.success) {
                        showAlert(
                          'Account Deleted',
                          'Your account and all data have been permanently deleted.',
                          [{ text: 'OK', onPress: () => router.replace('/chats?reload=true') }]
                        )
                      } else {
                        showAlert('Error', result.error || 'Failed to delete account', [{ text: 'OK' }])
                      }
                    },
                  },
                ]
              )
            }, 300)
          },
        },
      ]
    )
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
          <View style={styles.header}>
            <ThemedIconButton
              icon="chevron-left"
              onPress={() => router.back()}
              variant="primary"
              size="large"
            />
            <ThemedText type="title" style={[styles.title, { color: theme.colors.text }]}>
              Login
            </ThemedText>
          </View>

          {/* Login Form */}
          <View style={styles.section}>
            <View style={[styles.loginCard, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}>
              <View style={[styles.loginHeader, { borderBottomColor: theme.colors.borderLight }]}>
                <MaterialCommunityIcons name="login-variant" size={18} color={theme.colors.primary} />
                <ThemedText style={[styles.loginHeaderText, { color: theme.colors.text }]}>Welcome Back</ThemedText>
              </View>

              <View style={styles.loginForm}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                    placeholder="Email address"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={[styles.passwordContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <TextInput
                      style={[styles.passwordInput, { color: theme.colors.text }]}
                      placeholder="Password"
                      placeholderTextColor={theme.colors.textPlaceholder}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry={!showLoginPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <ThemedIconButton
                      icon={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      variant="ghost"
                      size="small"
                      style={styles.showPasswordButton}
                    />
                  </View>
                </View>

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
        <View style={styles.header}>
          <ThemedIconButton
            icon="chevron-left"
            onPress={() => router.back()}
            variant="primary"
            size="large"
          />
          <ThemedText type="title" style={[styles.title, { color: theme.colors.text }]}>
            My Profile
          </ThemedText>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}>
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
              fullWidth
            />
          ) : (
            <View style={[styles.passwordCard, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}>
              <View style={[styles.passwordHeader, { borderBottomColor: theme.colors.borderLight }]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={theme.colors.primary} />
                <ThemedText style={[styles.passwordHeaderText, { color: theme.colors.text }]}>Update Password</ThemedText>
              </View>

              <View style={styles.passwordForm}>
                {/* New Password */}
                <View style={styles.inputGroup}>
                  <View style={[styles.passwordContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <TextInput
                      style={[styles.passwordInput, { color: theme.colors.text }]}
                      placeholder="New password (min. 8 characters)"
                      placeholderTextColor={theme.colors.textPlaceholder}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <ThemedIconButton
                      icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      onPress={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="small"
                      style={styles.showPasswordButton}
                    />
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

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
            fullWidth
          />
        </View>

        {/* Delete Account Section */}
        <View style={styles.section}>
          <View style={[styles.dangerCard, { backgroundColor: theme.colors.backgroundDanger, borderColor: theme.colors.borderDanger }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 8,
  },
  backButton: {
    padding: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
    lineHeight: 40,
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
  inputGroup: {
    gap: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
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
    fontSize: 15,
  },
  showPasswordButton: {
    padding: 16,
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
