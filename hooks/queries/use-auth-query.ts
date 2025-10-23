import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthService } from '@/services/auth-service'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

// User profile query
export function useProfileQuery() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const user = await AuthService.getCurrentUser()
      return user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Signup mutation
export function useSignupMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await AuthService.signUpWithEmail(email, password)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create account')
      }

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
        throw new Error('CONFIRMATION_REQUIRED')
      }

      return result
    },
    onSuccess: async () => {
      // Refetch profile after successful signup
      await queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// Login mutation
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await AuthService.signInWithEmail(email, password)
      if (!result.success) {
        throw new Error(result.error || 'Failed to login')
      }
      return result
    },
    onSuccess: async () => {
      // Refetch profile after successful login
      await queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// Change password mutation
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const result = await AuthService.updatePassword(newPassword)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update password')
      }
      return result
    },
  })
}

// Logout mutation
export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await AuthService.signOut()
      if (!result.success) {
        throw new Error(result.error || 'Failed to logout')
      }
      return result
    },
    onSuccess: () => {
      // Clear all queries after logout
      queryClient.clear()
    },
  })
}

// Delete account mutation
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await AuthService.deleteAccount()
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account')
      }
      return result
    },
    onSuccess: () => {
      // Clear all queries after account deletion
      queryClient.clear()
    },
  })
}
