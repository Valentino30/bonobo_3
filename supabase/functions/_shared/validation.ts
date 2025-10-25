// @ts-nocheck - Deno project with .ts imports
// Validation utilities for common patterns
// Provides reusable validation functions for Edge Functions

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const VALID_PLANS = ['one-time', 'weekly', 'monthly'] as const
export const VALID_CURRENCIES = ['eur'] as const

export type PlanId = typeof VALID_PLANS[number]
export type Currency = typeof VALID_CURRENCIES[number]

export interface ValidationError {
  field?: string
  message: string
}

/**
 * Check if a string is a valid UUID
 * @param value - String to validate
 * @returns True if valid UUID format
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value)
}

/**
 * Check if a string is a valid plan ID
 * @param value - String to validate
 * @returns True if valid plan ID
 */
export function isValidPlanId(value: string): value is PlanId {
  return VALID_PLANS.includes(value as PlanId)
}

/**
 * Check if a string is a valid currency code
 * @param value - String to validate
 * @returns True if valid currency
 */
export function isValidCurrency(value: string): value is Currency {
  return VALID_CURRENCIES.includes(value.toLowerCase() as Currency)
}

/**
 * Require a field to be present
 * @param value - Value to check
 * @param fieldName - Name of the field for error messages
 * @returns The value if present
 * @throws Error if value is null or undefined
 */
export function requireField<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Missing required field: ${fieldName}`)
  }
  return value
}

/**
 * Validate a payment amount
 * @param amount - Amount to validate (in cents)
 * @param minAmount - Minimum allowed amount (default: 50 cents)
 * @param maxAmount - Maximum allowed amount (default: 100000 cents / €1000)
 * @returns The validated amount
 * @throws Error if amount is invalid
 */
export function validatePaymentAmount(
  amount: unknown,
  minAmount: number = 50,
  maxAmount: number = 100000
): number {
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number')
  }

  if (!Number.isInteger(amount)) {
    throw new Error('Amount must be an integer (in cents)')
  }

  if (amount < minAmount) {
    throw new Error(`Amount must be at least ${minAmount} cents`)
  }

  if (amount > maxAmount) {
    throw new Error(`Amount cannot exceed ${maxAmount} cents (€${maxAmount / 100})`)
  }

  return amount
}

/**
 * Validate a Stripe payment intent ID
 * @param value - Value to validate
 * @returns The validated payment intent ID
 * @throws Error if invalid format
 */
export function validatePaymentIntentId(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('paymentIntentId must be a string')
  }
  if (!value.startsWith('pi_')) {
    throw new Error('Invalid paymentIntentId format (must start with pi_)')
  }
  return value
}

/**
 * Validate that a value is a valid JSON object
 * @param data - Data to validate
 * @param expectedType - Optional expected type name for error messages
 * @returns The validated data
 * @throws Error if not a valid object
 */
export function validateJSON<T>(data: unknown, expectedType?: string): T {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(`Expected JSON object${expectedType ? ` of type ${expectedType}` : ''}`)
  }
  return data as T
}

/**
 * Validate UUID format
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @returns The validated UUID string
 * @throws Error if invalid UUID format
 */
export function validateUUID(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`)
  }
  if (!isValidUUID(value)) {
    throw new Error(`Invalid ${fieldName} format (must be UUID)`)
  }
  return value
}

/**
 * Validate plan ID
 * @param value - Value to validate
 * @returns The validated plan ID
 * @throws Error if invalid plan ID
 */
export function validatePlanId(value: unknown): PlanId {
  if (typeof value !== 'string') {
    throw new Error('planId must be a string')
  }
  if (!isValidPlanId(value)) {
    throw new Error(`Invalid plan. Valid plans: ${VALID_PLANS.join(', ')}`)
  }
  return value
}

/**
 * Validate currency code
 * @param value - Value to validate
 * @returns The validated currency code
 * @throws Error if invalid currency
 */
export function validateCurrency(value: unknown): Currency {
  if (typeof value !== 'string') {
    throw new Error('currency must be a string')
  }
  if (!isValidCurrency(value)) {
    throw new Error(`Invalid currency. Supported currencies: ${VALID_CURRENCIES.join(', ')}`)
  }
  return value.toLowerCase() as Currency
}
