import { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
} from './queries/use-auth-query'

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

  // React Query hooks
  const { data: user, isLoading, refetch } = useProfileQuery()
  const loginMutation = useLoginMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const logoutMutation = useLogoutMutation()
  const deleteAccountMutation = useDeleteAccountMutation()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Password change form state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Derived state
  const email = user?.email || ''
  const isAuthenticated = !!(user && user.email)

  const loadProfile = async () => {
    await refetch()
  }

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      onShowAlert('Missing Credentials', 'Please enter your email and password', [{ text: 'OK' }])
      return
    }

    try {
      await loginMutation.mutateAsync({ email: loginEmail, password: loginPassword })
      // Successfully logged in - redirect to chats and force reload
      router.replace('/chats?reload=true')
    } catch (error) {
      onShowAlert('Login Failed', error instanceof Error ? error.message : 'Failed to login', [{ text: 'OK' }])
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

    try {
      await changePasswordMutation.mutateAsync(newPassword)
      onShowAlert('Password Updated', 'Your password has been updated successfully', [{ text: 'Great!' }])
      setShowPasswordChange(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      onShowAlert('Update Failed', error instanceof Error ? error.message : 'Failed to update password', [
        { text: 'OK' },
      ])
    }
  }

  const handleLogout = () => {
    onShowAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync()
            // Redirect to chats and force reload (will show empty state since user logged out)
            router.replace('/chats?reload=true')
          } catch (error) {
            onShowAlert('Error', error instanceof Error ? error.message : 'Failed to logout', [{ text: 'OK' }])
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
                      try {
                        await deleteAccountMutation.mutateAsync()
                        onShowAlert('Account Deleted', 'Your account and all data have been permanently deleted.', [
                          { text: 'OK', onPress: () => router.replace('/chats?reload=true') },
                        ])
                      } catch (error) {
                        onShowAlert('Error', error instanceof Error ? error.message : 'Failed to delete account', [
                          { text: 'OK' },
                        ])
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
    isLoggingIn: loginMutation.isPending,

    // Password change state
    showPasswordChange,
    setShowPasswordChange,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isChangingPassword: changePasswordMutation.isPending,

    // Handlers
    handleLogin,
    handleChangePassword,
    handleLogout,
    handleDeleteAccount,
    loadProfile,
  }
}
