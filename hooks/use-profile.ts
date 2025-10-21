import { AuthService } from '@/utils/auth-service'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

export interface UseProfileReturn {
  // Auth state
  email: string
  isLoading: boolean
  isAuthenticated: boolean

  // Login state
  loginEmail: string
  setLoginEmail: (email: string) => void
  loginPassword: string
  setLoginPassword: (password: string) => void
  isLoggingIn: boolean

  // Password change state
  showPasswordChange: boolean
  setShowPasswordChange: (show: boolean) => void
  newPassword: string
  setNewPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  isChangingPassword: boolean

  // Handlers
  handleLogin: () => Promise<void>
  handleChangePassword: () => Promise<void>
  handleLogout: () => void
  handleDeleteAccount: () => void
  loadProfile: () => Promise<void>
}

export interface UseProfileOptions {
  onShowAlert: (title: string, message: string, buttons: { text: string; onPress?: () => void }[]) => void
}

export function useProfile({ onShowAlert }: UseProfileOptions): UseProfileReturn {
  const router = useRouter()

  // Auth state
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      onShowAlert('Missing Credentials', 'Please enter your email and password', [{ text: 'OK' }])
      return
    }

    setIsLoggingIn(true)

    const result = await AuthService.signInWithEmail(loginEmail, loginPassword)

    setIsLoggingIn(false)

    if (result.success) {
      // Successfully logged in - redirect to chats and force reload
      router.replace('/chats?reload=true')
    } else {
      onShowAlert('Login Failed', result.error || 'Failed to login', [{ text: 'OK' }])
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      onShowAlert('Missing Credentials', 'Please fill in all password fields', [{ text: 'OK' }])
      return
    }

    if (newPassword.length < 8) {
      onShowAlert('Password Too Short', 'Password must be at least 8 characters', [{ text: 'OK' }])
      return
    }

    if (newPassword !== confirmPassword) {
      onShowAlert('Password Mismatch', 'Passwords do not match', [{ text: 'OK' }])
      return
    }

    setIsChangingPassword(true)

    const result = await AuthService.updatePassword(newPassword)

    setIsChangingPassword(false)

    if (result.success) {
      onShowAlert('Password Updated', 'Your password has been updated successfully', [{ text: 'Great!' }])
      setShowPasswordChange(false)
      setNewPassword('')
      setConfirmPassword('')
    } else {
      onShowAlert('Update Failed', result.error || 'Failed to update password', [{ text: 'OK' }])
    }
  }

  const handleLogout = () => {
    onShowAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          const result = await AuthService.signOut()
          if (result.success) {
            // Redirect to chats and force reload (will show empty state since user logged out)
            router.replace('/chats?reload=true')
          } else {
            onShowAlert('Error', result.error || 'Failed to logout', [{ text: 'OK' }])
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    onShowAlert(
      'Delete Account',
      'This will permanently delete your account and ALL associated data including chats, purchases, and insights. This action CANNOT be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: () => {
            // Add delay before showing second confirmation to allow first alert to close
            setTimeout(() => {
              onShowAlert(
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
                        onShowAlert('Account Deleted', 'Your account and all data have been permanently deleted.', [
                          { text: 'OK', onPress: () => router.replace('/chats?reload=true') },
                        ])
                      } else {
                        onShowAlert('Error', result.error || 'Failed to delete account', [{ text: 'OK' }])
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

  return {
    // Auth state
    email,
    isLoading,
    isAuthenticated,

    // Login state
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    isLoggingIn,

    // Password change state
    showPasswordChange,
    setShowPasswordChange,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isChangingPassword,

    // Handlers
    handleLogin,
    handleChangePassword,
    handleLogout,
    handleDeleteAccount,
    loadProfile,
  }
}
