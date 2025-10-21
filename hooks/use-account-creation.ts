import { useState } from 'react'
import { validateEmail, validatePassword } from '@/utils/validation'
import { useSignupMutation } from './queries/use-auth-query'

interface UseAccountCreationOptions {
  onSuccess: () => void
  onConfirmationRequired?: () => void
}

export function useAccountCreation({ onSuccess, onConfirmationRequired }: UseAccountCreationOptions) {
  // React Query hook
  const signupMutation = useSignupMutation()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const clearForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  const validateCredentials = (): { isValid: boolean; error?: string } => {
    if (!email || !password || !confirmPassword) {
      return { isValid: false, error: 'Please fill in all fields' }
    }

    if (!validateEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }

    if (!validatePassword(password)) {
      return { isValid: false, error: 'Password must be at least 8 characters' }
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' }
    }

    return { isValid: true }
  }

  const handleCreateAccount = async () => {
    setError(null)

    // Validation
    const validation = validateCredentials()
    if (!validation.isValid) {
      setError(validation.error!)
      return { success: false }
    }

    try {
      const result = await signupMutation.mutateAsync({ email, password })

      // Clear form
      clearForm()

      // Call onSuccess callback
      onSuccess()

      return { success: true, user: result.user }
    } catch (error) {
      // Handle confirmation required error
      if (error instanceof Error && error.message === 'CONFIRMATION_REQUIRED') {
        setError('Account created but email confirmation is required. Please check your email and then login.')

        if (onConfirmationRequired) {
          onConfirmationRequired()
        }

        return { success: false, requiresConfirmation: true }
      }

      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Account creation error:', error)
      return { success: false }
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading: signupMutation.isPending,
    error,
    setError,
    handleCreateAccount,
    clearForm,
  }
}
