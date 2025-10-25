// @ts-nocheck - Deno project with .ts imports
// Entitlement management utilities
// Provides shared logic for creating and managing user entitlements

// @ts-ignore: Deno-specific imports
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import type { PlanId } from './validation.ts'

export interface EntitlementData {
  device_id?: string
  user_id?: string
  plan_id: PlanId
  stripe_payment_intent_id: string
  stripe_customer_id: string
  status: 'active' | 'cancelled' | 'expired'
  purchased_at: string
  expires_at: string | null
  remaining_analyses: number
  chat_id?: string
}

export interface PlanConfig {
  planId: PlanId
  remainingAnalyses: number
  expiresAt: string | null
}

/**
 * Calculate expiration date and remaining analyses based on plan
 * @param planId - Plan identifier (one-time, weekly, monthly)
 * @returns Plan configuration with expiration and analysis limits
 */
export function calculatePlanExpiration(planId: PlanId): PlanConfig {
  let expiresAt: string | null = null
  let remainingAnalyses = 0

  if (planId === 'one-time') {
    // One-time purchase: 1 analysis, no expiration
    remainingAnalyses = 1
  } else if (planId === 'weekly') {
    // Weekly subscription: unlimited analyses for 7 days
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    expiresAt = weekFromNow.toISOString()
  } else if (planId === 'monthly') {
    // Monthly subscription: unlimited analyses for 30 days
    const monthFromNow = new Date()
    monthFromNow.setMonth(monthFromNow.getMonth() + 1)
    expiresAt = monthFromNow.toISOString()
  }

  return { planId, remainingAnalyses, expiresAt }
}

/**
 * Create a new entitlement in the database
 * @param supabase - Supabase client instance
 * @param data - Entitlement data to insert
 * @returns Created entitlement with ID
 * @throws Error if database operation fails
 */
export async function createEntitlement(
  supabase: SupabaseClient,
  data: EntitlementData
): Promise<{ id: string }> {
  const { data: entitlement, error: dbError } = await supabase
    .from('user_entitlements')
    .insert(data)
    .select()
    .single()

  if (dbError) {
    throw new Error(`Failed to create entitlement: ${dbError.message}`)
  }

  if (!entitlement) {
    throw new Error('Entitlement created but no data returned')
  }

  return { id: entitlement.id }
}

/**
 * Find an existing entitlement by payment intent ID
 * @param supabase - Supabase client instance
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Existing entitlement or null if not found
 * @throws Error if database operation fails
 */
export async function findExistingEntitlement(
  supabase: SupabaseClient,
  paymentIntentId: string
): Promise<{ id: string; status: string } | null> {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('id, status')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }

  return data
}

/**
 * Check if a user has active entitlement for a specific chat
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param chatId - Chat ID (optional, for one-time purchases)
 * @returns True if user has active access
 */
export async function hasActiveEntitlement(
  supabase: SupabaseClient,
  userId: string,
  chatId?: string
): Promise<boolean> {
  const now = new Date().toISOString()

  let query = supabase
    .from('user_entitlements')
    .select('id, plan_id, expires_at, remaining_analyses, chat_id')
    .eq('user_id', userId)
    .eq('status', 'active')

  // For subscriptions, check expiration
  const { data: subscriptions } = await query
    .in('plan_id', ['weekly', 'monthly'])
    .gt('expires_at', now)
    .limit(1)

  if (subscriptions && subscriptions.length > 0) {
    return true
  }

  // For one-time purchases, check chat-specific entitlement
  if (chatId) {
    const { data: oneTime } = await query
      .eq('plan_id', 'one-time')
      .eq('chat_id', chatId)
      .gt('remaining_analyses', 0)
      .limit(1)

    if (oneTime && oneTime.length > 0) {
      return true
    }
  }

  return false
}

/**
 * Decrement remaining analyses for a one-time purchase
 * @param supabase - Supabase client instance
 * @param entitlementId - Entitlement ID
 * @returns Updated remaining analyses count
 * @throws Error if operation fails
 */
export async function decrementRemainingAnalyses(
  supabase: SupabaseClient,
  entitlementId: string
): Promise<number> {
  const { data, error } = await supabase
    .rpc('decrement_analyses', { entitlement_id: entitlementId })

  if (error) {
    throw new Error(`Failed to decrement analyses: ${error.message}`)
  }

  return data
}

/**
 * Cancel an entitlement (for subscriptions)
 * @param supabase - Supabase client instance
 * @param entitlementId - Entitlement ID
 * @throws Error if operation fails
 */
export async function cancelEntitlement(
  supabase: SupabaseClient,
  entitlementId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_entitlements')
    .update({ status: 'cancelled' })
    .eq('id', entitlementId)

  if (error) {
    throw new Error(`Failed to cancel entitlement: ${error.message}`)
  }
}
