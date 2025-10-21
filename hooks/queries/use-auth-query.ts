import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthService } from '@/utils/auth-service'

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
