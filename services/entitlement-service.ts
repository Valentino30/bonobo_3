import { supabase } from '@/supabase/client'
import { getDeviceId } from '@/utils/device-id'

/**
 * Check if user has access to AI insights for a specific chat
 */
export async function hasAccess(chatId?: string): Promise<boolean> {
  console.log('🚀 hasAccess() FUNCTION CALLED with chatId:', chatId, 'type:', typeof chatId)
  try {
    const deviceId = await getDeviceId()
    console.log('📱 Retrieved device ID:', deviceId)

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 ACCESS CHECK START')
    console.log('  Device ID:', deviceId)
    console.log('  User ID:', user?.id || 'none (anonymous)')
    console.log('  Chat ID:', chatId || 'none provided')
    console.log('  Chat ID Type:', typeof chatId)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    let query = supabase
      .from('user_entitlements')
      .select('*')
      .eq('status', 'active')
      // CRITICAL: Only consider entitlements with valid Stripe payment
      .not('stripe_payment_intent_id', 'is', null)
      // Also exclude empty strings (should never happen, but extra safety)
      .neq('stripe_payment_intent_id', '')

    // If user is authenticated, ONLY check by user_id
    // Otherwise, check by device_id only
    if (user) {
      console.log('🔐 User is authenticated - querying by user_id:', user.id)
      query = query.eq('user_id', user.id)
    } else {
      console.log('👤 Anonymous user - querying by device_id:', deviceId)
      query = query.eq('device_id', deviceId)
    }

    console.log('🔍 Executing database query for entitlements...')
    const { data: entitlements, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error checking access:', error)
      console.error('Error details:', JSON.stringify(error))
      return false
    }

    console.log(
      `📋 Query returned ${entitlements?.length ?? 0} entitlements (filtered by active status + valid payment)`
    )

    if (!entitlements || entitlements.length === 0) {
      console.log('❌ No valid entitlements found')
      return false
    }

    // Check each entitlement
    for (const entitlement of entitlements) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔍 Examining Entitlement:')
      console.log('  ID:', entitlement.id)
      console.log('  Plan:', entitlement.plan_id)
      console.log('  Chat ID:', entitlement.chat_id, '(type:', typeof entitlement.chat_id + ')')
      console.log('  Status:', entitlement.status)
      console.log('  Expires:', entitlement.expires_at || 'N/A')
      console.log('  Payment Intent:', entitlement.stripe_payment_intent_id)
      console.log('  Device ID:', entitlement.device_id)
      console.log('  User ID:', entitlement.user_id || 'null')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Check one-time purchase
      if (entitlement.plan_id === 'one-time') {
        console.log('📦 ONE-TIME PURCHASE CHECK:')

        // CRITICAL: One-time purchases must be checked with chatId
        if (!chatId) {
          console.log('  ⚠️ No chatId provided - skipping this entitlement')
          continue
        }

        console.log('  Comparing:')
        console.log('    Entitlement chat_id:', entitlement.chat_id, '(' + typeof entitlement.chat_id + ')')
        console.log('    Request chatId:', chatId, '(' + typeof chatId + ')')
        console.log('    Are they equal?', entitlement.chat_id === chatId)
        console.log('    Is entitlement unassigned?', entitlement.chat_id === null)

        // One-time purchase is valid ONLY if:
        // 1. It's assigned to THIS specific chat (chat_id === chatId)
        // 2. OR it's unassigned (chat_id === null) - available to be assigned to this chat
        if (entitlement.chat_id === chatId) {
          console.log('  ✅ MATCH! Entitlement assigned to this exact chat')
          console.log('  ✅ ACCESS GRANTED')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          return true
        } else if (entitlement.chat_id === null) {
          console.log('  ✅ AVAILABLE! Entitlement is unassigned')
          console.log('  ✅ ACCESS GRANTED')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          return true
        } else {
          console.log('  ❌ MISMATCH! Already assigned to different chat:', entitlement.chat_id)
          console.log('  Continuing to check other entitlements...')
          // Continue checking other entitlements
        }
      }

      // Check time-based subscriptions (weekly, monthly)
      if (entitlement.plan_id === 'weekly' || entitlement.plan_id === 'monthly') {
        if (!entitlement.expires_at) {
          console.error('⚠️ Subscription missing expiry date:', entitlement.id)
          continue
        }

        const expiryDate = new Date(entitlement.expires_at)
        const now = new Date()

        if (now < expiryDate) {
          console.log(
            `✅ Access granted: Active ${entitlement.plan_id} subscription (expires ${expiryDate.toISOString()})`
          )
          return true
        } else {
          console.log(`❌ Subscription expired at ${expiryDate.toISOString()}`)
          // Mark as expired
          await supabase.from('user_entitlements').update({ status: 'expired' }).eq('id', entitlement.id)
        }
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('❌ ACCESS DENIED - No valid entitlement found')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return false
  } catch (error) {
    console.error('❌ Error checking access (exception):', error)
    return false
  }
}

/**
 * Assign one-time purchase to a specific chat
 */
export async function assignAnalysisToChat(chatId: string): Promise<void> {
  try {
    const deviceId = await getDeviceId()

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('🎯 Assigning one-time purchase to chat:', chatId)
    console.log('  Device ID:', deviceId)
    console.log('  User ID:', user?.id || 'none (anonymous)')

    // Find unassigned one-time purchase
    let query = supabase
      .from('user_entitlements')
      .select('*')
      .eq('plan_id', 'one-time')
      .eq('status', 'active')
      .is('chat_id', null)

    // Match by user_id if authenticated, otherwise by device_id
    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('device_id', deviceId)
    }

    const { data: entitlements, error: fetchError } = await query

    if (fetchError) {
      console.error('❌ Error fetching unassigned entitlements:', fetchError)
      throw fetchError
    }

    if (!entitlements || entitlements.length === 0) {
      console.log('⚠️ No unassigned one-time purchase found')
      return
    }

    // Assign the first unassigned one-time purchase to this chat
    const entitlement = entitlements[0]

    console.log('✅ Found unassigned entitlement:', entitlement.id)
    console.log('  Assigning to chat:', chatId)

    const { error: updateError } = await supabase
      .from('user_entitlements')
      .update({ chat_id: chatId })
      .eq('id', entitlement.id)

    if (updateError) {
      console.error('❌ Error assigning entitlement to chat:', updateError)
      throw updateError
    }

    console.log('✅ Successfully assigned one-time purchase to chat:', chatId)
  } catch (error) {
    console.error('❌ Error in assignAnalysisToChat:', error)
    throw error
  }
}

/**
 * Check if user has an active subscription (not one-time)
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const deviceId = await getDeviceId()

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let query = supabase
      .from('user_entitlements')
      .select('*')
      .eq('status', 'active')
      .in('plan_id', ['weekly', 'monthly'])

    // Match by user_id if authenticated, otherwise by device_id
    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('device_id', deviceId)
    }

    const { data: entitlements, error } = await query

    if (error) {
      console.error('Error checking subscription:', error)
      return false
    }

    if (!entitlements || entitlements.length === 0) {
      return false
    }

    // Check if any subscription is still valid
    for (const entitlement of entitlements) {
      if (entitlement.expires_at) {
        const expiryDate = new Date(entitlement.expires_at)
        const now = new Date()

        if (now < expiryDate) {
          return true
        }
      }
    }

    return false
  } catch (error) {
    console.error('Error in hasActiveSubscription:', error)
    return false
  }
}

