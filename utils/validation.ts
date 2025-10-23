/**
 * Email validation using regex pattern
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password validation
 * Requires minimum 8 characters
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8
}
