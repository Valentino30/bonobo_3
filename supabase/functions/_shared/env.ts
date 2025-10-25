// @ts-nocheck - Deno project with .ts imports
// Environment variable management utilities
// Provides type-safe access to environment variables with validation

export interface Environment {
  stripeSecretKey: string
  stripeWebhookSecret?: string
  supabaseUrl: string
  supabaseServiceKey: string
  supabaseAnonKey: string
  allowedOrigins?: string
}

export const STRIPE_API_VERSION = '2024-11-20.acacia' as const

/**
 * Load environment variables with validation
 * @param required - Array of required environment variable keys
 * @returns Environment object with all variables
 * @throws Error if required variables are missing
 */
// @ts-ignore: Deno-specific
export function loadEnvironment(required: (keyof Environment)[] = []): Environment {
  // @ts-ignore: Deno-specific
  const env: Partial<Environment> = {
    // @ts-ignore: Deno global
    stripeSecretKey: Deno.env.get('STRIPE_SECRET_KEY'),
    // @ts-ignore: Deno global
    stripeWebhookSecret: Deno.env.get('STRIPE_WEBHOOK_SECRET'),
    // @ts-ignore: Deno global
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    // @ts-ignore: Deno global
    supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    // @ts-ignore: Deno global
    supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY'),
    // @ts-ignore: Deno global
    allowedOrigins: Deno.env.get('ALLOWED_ORIGINS'),
  }

  const missing = required.filter(key => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return env as Environment
}

/**
 * Validate that required environment variables are present
 * @param env - Partial environment object
 * @param required - Array of required keys
 * @throws Error if required variables are missing
 */
export function validateEnvironment(
  env: Partial<Environment>,
  required: (keyof Environment)[]
): void {
  const missing = required.filter(key => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
