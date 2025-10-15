import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { AuthService } from '@/utils/auth-service'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
      // Not authenticated - redirect to chats
      Alert.alert(
        'Not Authenticated',
        'Please create an account after making a purchase to access your profile.',
        [{ text: 'OK', onPress: () => router.replace('/chats') }]
      )
      return
    }

    setEmail(user.email)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields')
      return
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    setIsChangingPassword(true)

    const result = await AuthService.updatePassword(newPassword)

    setIsChangingPassword(false)

    if (result.success) {
      Alert.alert('Success', 'Your password has been updated successfully')
      setShowPasswordChange(false)
      setNewPassword('')
      setConfirmPassword('')
    } else {
      Alert.alert('Error', result.error || 'Failed to update password')
    }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          const result = await AuthService.signOut()
          if (result.success) {
            Alert.alert('Logged Out', 'You have been logged out successfully', [
              { text: 'OK', onPress: () => router.replace('/chats') },
            ])
          } else {
            Alert.alert('Error', result.error || 'Failed to logout')
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and ALL associated data including chats, purchases, and insights. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Are You Absolutely Sure?',
              'This is your last chance to cancel. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    setIsLoading(true)
                    const result = await AuthService.deleteAccount()
                    setIsLoading(false)

                    if (result.success) {
                      Alert.alert(
                        'Account Deleted',
                        'Your account and all data have been permanently deleted.',
                        [{ text: 'OK', onPress: () => router.replace('/chats') }]
                      )
                    } else {
                      Alert.alert('Error', result.error || 'Failed to delete account')
                    }
                  },
                },
              ]
            )
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
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </SafeAreaView>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#6B8E5A" />
          </View>
          <ThemedText type="title" style={styles.title}>
            Your Profile
          </ThemedText>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={20} color="#666666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Email Address</ThemedText>
                <ThemedText style={styles.infoValue}>{email}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Password Change Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Security</ThemedText>
          {!showPasswordChange ? (
            <TouchableOpacity style={styles.button} onPress={() => setShowPasswordChange(true)}>
              <MaterialCommunityIcons name="lock-reset" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>Change Password</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <View style={styles.passwordForm}>
                {/* New Password */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>New Password</ThemedText>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Minimum 8 characters"
                      placeholderTextColor="#999999"
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
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your new password"
                    placeholderTextColor="#999999"
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
                    <ThemedText style={[styles.buttonText, styles.buttonTextSecondary]}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary, isChangingPassword && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Update Password</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.button, styles.buttonLogout]} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Delete Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
          <View style={styles.dangerCard}>
            <View style={styles.dangerInfo}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#D32F2F" />
              <View style={styles.dangerTextContainer}>
                <ThemedText style={styles.dangerTitle}>Delete Account</ThemedText>
                <ThemedText style={styles.dangerDescription}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.buttonDanger} onPress={handleDeleteAccount}>
              <MaterialCommunityIcons name="delete-forever" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>Delete My Account</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Back to Chats</ThemedText>
        </TouchableOpacity>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#6B8E5A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#E0E0E0',
  },
  buttonTextSecondary: {
    color: '#666666',
  },
  buttonPrimary: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLogout: {
    backgroundColor: '#757575',
  },
  buttonDanger: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  passwordForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dangerCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#999999',
  },
})
