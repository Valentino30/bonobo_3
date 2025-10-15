import { supabase } from './supabase'
import { getDeviceId } from './device-id'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: string
  user?: User
  session?: Session
}

export interface UserProfile {
  email: string
  userId: string
  isAnonymous: boolean
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   * This converts an anonymous session into a permanent account
   */
  static async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('Attempting to sign up with email:', email)

      // Use linkIdentity to convert anonymous session to email/password account
      // This preserves the current session and links the new identity
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('Sign up error:', error)
        return {
          success: false,
          error: error.message,
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Failed to create user account',
        }
      }

      console.log('✅ User signed up successfully:', {
        userId: data.user.id,
        email: data.user.email,
        emailConfirmedAt: data.user.email_confirmed_at,
        hasSession: !!data.session,
        sessionAccessToken: data.session?.access_token ? 'has token' : 'no token',
      })

      // Check if email confirmation is required
      if (!data.session) {
        console.warn('⚠️ No session created - email confirmation may be required')
        console.warn('Check your Supabase dashboard: Authentication > Settings > "Enable email confirmations"')
      }

      // Migrate device data to the new user
      const migrationSuccess = await this.migrateDeviceDataToUser(data.user.id)

      // Note: Migration failure doesn't fail the signup since account is already created
      // User can still use the app, they just won't have their old data migrated
      if (!migrationSuccess) {
        console.warn('⚠️ Account created but data migration had issues')
      }

      return {
        success: true,
        user: data.user,
        session: data.session ?? undefined,
      }
    } catch (error) {
      console.error('Sign up error (catch):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('Attempting to sign in with email:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        return {
          success: false,
          error: error.message,
        }
      }

      console.log('✅ User signed in successfully:', data.user.id)

      return {
        success: true,
        user: data.user,
        session: data.session,
      }
    } catch (error) {
      console.error('Sign in error (catch):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        return {
          success: false,
          error: error.message,
        }
      }

      console.log('✅ User signed out successfully')

      return {
        success: true,
      }
    } catch (error) {
      console.error('Sign out error (catch):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }
    }
  }

  /**
   * Update the user's password
   */
  static async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error('Password update error:', error)
        return {
          success: false,
          error: error.message,
        }
      }

      console.log('✅ Password updated successfully')

      return {
        success: true,
        user: data.user,
      }
    } catch (error) {
      console.error('Password update error (catch):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password update failed',
      }
    }
  }

  /**
   * Delete the current user's account and all associated data
   * This calls the Supabase function to perform a cascading delete
   */
  static async deleteAccount(): Promise<AuthResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          success: false,
          error: 'No user logged in',
        }
      }

      console.log('Deleting account for user:', user.id)

      // Call the Supabase RPC function to delete user and all data
      const { error: rpcError } = await supabase.rpc('delete_user_completely', {
        p_user_id: user.id,
      })

      if (rpcError) {
        console.error('Account deletion error:', rpcError)
        return {
          success: false,
          error: rpcError.message,
        }
      }

      console.log('✅ Account deleted successfully')

      return {
        success: true,
      }
    } catch (error) {
      console.error('Account deletion error (catch):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Account deletion failed',
      }
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      return {
        email: user.email || '',
        userId: user.id,
        isAnonymous: !user.email, // If no email, consider it anonymous
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Check if the user is authenticated with email/password
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔐 isAuthenticated check:', {
        hasUser: !!user,
        hasEmail: !!user?.email,
        emailConfirmedAt: user?.email_confirmed_at,
        userId: user?.id
      })
      return !!user && !!user.email
    } catch (error) {
      console.error('🔐 isAuthenticated error:', error)
      return false
    }
  }

  /**
   * Migrate device data to authenticated user
   * This links all chats and entitlements from the device to the user account
   * Returns true if migration succeeded, false otherwise
   */
  private static async migrateDeviceDataToUser(userId: string): Promise<boolean> {
    try {
      const deviceId = await getDeviceId()

      console.log('🔄 Starting data migration:', { deviceId, userId })

      // Call the Supabase RPC function to migrate data
      const { data, error } = await supabase.rpc('migrate_device_data_to_user', {
        p_device_id: deviceId,
        p_user_id: userId,
      })

      if (error) {
        console.error('❌ Data migration RPC error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })

        // Check if it's a function not found error
        if (error.message?.includes('function') || error.code === '42883') {
          console.error('⚠️ Migration function not found in database. Please run the migration SQL.')
          console.error('Migration file: supabase/migrations/20241015000000_add_auth_support.sql')
        }

        return false
      }

      console.log('✅ Data migrated successfully:', data)
      return true
    } catch (error) {
      console.error('❌ Data migration exception:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }
      return false
    }
  }

  /**
   * Check if email is available (not already registered)
   */
  static async isEmailAvailable(email: string): Promise<boolean> {
    try {
      // Try to sign in with a dummy password
      // If it fails with "Invalid login credentials", email exists
      // This is a workaround since Supabase doesn't expose an "email exists" endpoint
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: '__dummy_password_that_will_never_match__',
      })

      if (error) {
        // If error is "Invalid login credentials", email exists
        if (error.message.includes('Invalid login credentials')) {
          return false // Email is taken
        }
        // Other errors (like rate limiting) - assume available
        return true
      }

      // Should never reach here, but if sign-in succeeds, email exists
      return false
    } catch (error) {
      // On error, assume email is available
      return true
    }
  }
}
