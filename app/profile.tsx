import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { AuthService } from '@/utils/auth-service'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCustomAlert } from '@/components/custom-alert'

export default function ProfileScreen() {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B8E5A" />
        </View>
      </SafeAreaView>
    )
  }

  if (!isAuthenticated) {
    // Show login screen
    return (
      <SafeAreaView style={styles.container}>
        <AlertComponent />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#6B8E5A" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              Login
            </ThemedText>
          </View>

          {/* Login Form */}
          <View style={styles.section}>
            <View style={styles.loginCard}>
              <View style={styles.loginHeader}>
                <MaterialCommunityIcons name="login-variant" size={18} color="#6B8E5A" />
                <ThemedText style={styles.loginHeaderText}>Welcome Back</ThemedText>
              </View>

              <View style={styles.loginForm}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#CCCCCC"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Password"
                      placeholderTextColor="#CCCCCC"
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry={!showLoginPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.showPasswordButton}
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#999999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, isLoggingIn && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={styles.buttonText}>Login</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Info Text */}
          <View style={styles.section}>
            <ThemedText style={styles.infoText}>
              Don&apos;t have an account? Create one after making a purchase to save your insights.
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <AlertComponent />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#6B8E5A" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            My Profile
          </ThemedText>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#6B8E5A" />
              <ThemedText style={styles.cardLabel}>Email</ThemedText>
            </View>
            <ThemedText style={styles.cardValue}>{email}</ThemedText>
          </View>
        </View>

        {/* Password Change Section */}
        <View style={styles.section}>
          {!showPasswordChange ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowPasswordChange(true)}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#6B8E5A" />
              <ThemedText style={styles.actionButtonText}>Change Password</ThemedText>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ) : (
            <View style={styles.passwordCard}>
              <View style={styles.passwordHeader}>
                <MaterialCommunityIcons name="lock-outline" size={18} color="#6B8E5A" />
                <ThemedText style={styles.passwordHeaderText}>Update Password</ThemedText>
              </View>

              <View style={styles.passwordForm}>
                {/* New Password */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="New password (min. 8 characters)"
                      placeholderTextColor="#CCCCCC"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.showPasswordButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#999999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#CCCCCC"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Buttons */}
                <View style={styles.passwordButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => {
                      setShowPasswordChange(false)
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    disabled={isChangingPassword}
                  >
                    <ThemedText style={styles.buttonTextSecondary}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary, isChangingPassword && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Update</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout-variant" size={20} color="#6B8E5A" />
            <ThemedText style={styles.actionButtonText}>Logout</ThemedText>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Delete Account Section */}
        <View style={styles.section}>
          <View style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#C62828" />
              <ThemedText style={styles.dangerTitle}>Danger Zone</ThemedText>
            </View>
            <ThemedText style={styles.dangerDescription}>
              Permanently delete your account and all data. This cannot be undone.
            </ThemedText>
            <TouchableOpacity style={styles.buttonDanger} onPress={handleDeleteAccount}>
              <ThemedText style={styles.buttonDangerText}>Delete Account</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#1A1A1A',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  loginHeaderText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
  },
  loginForm: {
    gap: 16,
  },
  passwordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  passwordHeaderText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
  },
  passwordForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
  },
  showPasswordButton: {
    padding: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6B8E5A',
  },
  buttonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextSecondary: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dangerCard: {
    backgroundColor: '#FFF8F8',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0E0',
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
    color: '#C62828',
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDangerText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
})
