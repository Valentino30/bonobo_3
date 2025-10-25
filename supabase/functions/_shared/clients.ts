// @ts-nocheck - Deno project with .ts imports
// Client initialization utilities for Stripe and Supabase
// Provides consistent client setup across all Edge Functions

// @ts-ignore: Deno-specific imports
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
// @ts-ignore: Deno-specific imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { STRIPE_API_VERSION, type Environment } from './env.ts'

export interface ClientInstances {
  stripe: Stripe
  supabase: ReturnType<typeof createClient>
}

/**
 * Initialize both Stripe and Supabase clients
 * @param env - Environment configuration
 * @returns Object containing initialized clients
 */
export function initializeClients(env: Environment): ClientInstances {
  const stripe = new Stripe(env.stripeSecretKey, {
    apiVersion: STRIPE_API_VERSION,
    // @ts-ignore: Stripe types
    httpClient: Stripe.createFetchHttpClient(),
  })

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey)

  return { stripe, supabase }
}

/**
 * Initialize Stripe client only
 * @param stripeSecretKey - Stripe secret key
 * @returns Initialized Stripe client
 */
export function initializeStripe(stripeSecretKey: string): Stripe {
  return new Stripe(stripeSecretKey, {
    apiVersion: STRIPE_API_VERSION,
    // @ts-ignore: Stripe types
    httpClient: Stripe.createFetchHttpClient(),
  })
}

/**
 * Initialize Supabase client only
 * @param supabaseUrl - Supabase project URL
 * @param supabaseServiceKey - Supabase service role key
 * @returns Initialized Supabase client
 */
export function initializeSupabase(supabaseUrl: string, supabaseServiceKey: string) {
  return createClient(supabaseUrl, supabaseServiceKey)
}
