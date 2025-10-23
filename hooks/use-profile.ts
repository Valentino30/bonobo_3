import { useState } from 'react'
import { useRouter } from 'expo-router'
import i18n from '@/i18n/config'
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
      onShowAlert(i18n.t('auth.missingCredentials'), i18n.t('auth.missingCredentialsMessage'), [
        { text: i18n.t('alerts.ok') },
      ])
      return
    }

    try {
      await loginMutation.mutateAsync({ email: loginEmail, password: loginPassword })
      // Successfully logged in - redirect to chats (React Query will refetch automatically)
      router.replace('/chats')
    } catch (error) {
      onShowAlert(i18n.t('auth.loginFailed'), error instanceof Error ? error.message : i18n.t('auth.loginFailed'), [
        { text: i18n.t('alerts.ok') },
      ])
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      onShowAlert(i18n.t('auth.missingCredentials'), i18n.t('auth.missingPasswordFieldsMessage'), [
        { text: i18n.t('alerts.ok') },
      ])
      return
    }

    if (newPassword.length < 8) {
      onShowAlert(i18n.t('auth.passwordTooShort'), i18n.t('auth.passwordTooShortMessage'), [
        { text: i18n.t('alerts.ok') },
      ])
      return
    }

    if (newPassword !== confirmPassword) {
      onShowAlert(i18n.t('auth.passwordMismatch'), i18n.t('auth.passwordMismatchMessage'), [
        { text: i18n.t('alerts.ok') },
      ])
      return
    }

    try {
      await changePasswordMutation.mutateAsync(newPassword)
      onShowAlert(i18n.t('auth.passwordUpdated'), i18n.t('auth.passwordUpdatedMessage'), [
        { text: i18n.t('alerts.great') },
      ])
      setShowPasswordChange(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      onShowAlert(i18n.t('auth.updateFailed'), error instanceof Error ? error.message : i18n.t('auth.updateFailed'), [
        { text: i18n.t('alerts.ok') },
      ])
    }
  }

  const handleLogout = () => {
    onShowAlert(i18n.t('auth.logoutTitle'), i18n.t('auth.logoutMessage'), [
      { text: i18n.t('common.cancel') },
      {
        text: i18n.t('profile.logout'),
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync()
            // Redirect to chats (React Query will refetch automatically)
            router.replace('/chats')
          } catch (error) {
            onShowAlert(i18n.t('errors.error'), error instanceof Error ? error.message : i18n.t('errors.generic'), [
              { text: i18n.t('alerts.ok') },
            ])
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    onShowAlert(i18n.t('auth.deleteAccountTitle'), i18n.t('auth.deleteAccountWarning'), [
      { text: i18n.t('common.cancel') },
      {
        text: i18n.t('common.delete'),
        onPress: () => {
          // Add delay before showing second confirmation to allow first alert to close
          setTimeout(() => {
            onShowAlert(i18n.t('auth.deleteAccountFinalWarning'), i18n.t('auth.deleteAccountFinalMessage'), [
              { text: i18n.t('common.cancel') },
              {
                text: i18n.t('auth.deleteEverythingButton'),
                onPress: async () => {
                  try {
                    await deleteAccountMutation.mutateAsync()
                    onShowAlert(i18n.t('auth.accountDeleted'), i18n.t('auth.accountDeletedMessage'), [
                      { text: i18n.t('alerts.ok'), onPress: () => router.replace('/chats') },
                    ])
                  } catch (error) {
                    onShowAlert(
                      i18n.t('errors.error'),
                      error instanceof Error ? error.message : i18n.t('errors.generic'),
                      [{ text: i18n.t('alerts.ok') }]
                    )
                  }
                },
              },
            ])
          }, 300)
        },
      },
    ])
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
