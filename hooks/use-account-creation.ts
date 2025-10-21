import { useState } from 'react'
import { AuthService } from '@/utils/auth-service'
import { validateEmail, validatePassword } from '@/utils/validation'

interface UseAccountCreationOptions {
  onSuccess: () => void
  onConfirmationRequired?: () => void
}

interface AccountCreationState {
  email: string
  password: string
  confirmPassword: string
  isLoading: boolean
  error: string | null
}

export function useAccountCreation({ onSuccess, onConfirmationRequired }: UseAccountCreationOptions) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  const handleCreateAccount = async () => {
    setError(null)

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return { success: false }
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return { success: false }
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters')
      return { success: false }
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return { success: false }
    }

    setIsLoading(true)

    try {
      // Create the account - Supabase will handle duplicate email errors
      const result = await AuthService.signUpWithEmail(email, password)

      if (!result.success) {
        setError(result.error || 'Failed to create account')
        setIsLoading(false)
        return { success: false }
      }

      // Success! Log the result
      console.log('✅ Account creation result:', {
        success: result.success,
        hasUser: !!result.user,
        hasSession: !!result.session,
        userId: result.user?.id,
        userEmail: result.user?.email,
      })

      // Check if session was created (email confirmation may be required)
      if (!result.session) {
        console.warn('⚠️ No session created - email confirmation required')
        setError('Account created but email confirmation is required. Please check your email and then login.')
        setIsLoading(false)

        if (onConfirmationRequired) {
          onConfirmationRequired()
        }

        return { success: false, requiresConfirmation: true }
      }

      // Clear form
      clearForm()

      // Call onSuccess callback
      onSuccess()

      return { success: true, user: result.user }
    } catch (error) {
      console.error('Account creation error:', error)
      setError('An unexpected error occurred')
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  return {
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
    clearForm,
  }
}
