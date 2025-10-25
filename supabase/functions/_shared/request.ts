// @ts-nocheck - Deno project with .ts imports
// Request parsing utilities
// Provides consistent request body parsing and validation

export class RequestError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'RequestError'
  }
}

/**
 * Parse JSON from request body with error handling
 * @param req - Request object
 * @returns Parsed JSON data
 * @throws RequestError if JSON is invalid
 */
export async function parseJSON<T>(req: Request): Promise<T> {
  try {
    const data = await req.json()
    return data as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new RequestError(400, 'Invalid JSON in request body')
    }
    throw new RequestError(400, 'Failed to parse request body')
  }
}

/**
 * Parse text from request body
 * @param req - Request object
 * @returns Request body as text
 * @throws RequestError if reading fails
 */
export async function parseText(req: Request): Promise<string> {
  try {
    return await req.text()
  } catch (error) {
    throw new RequestError(400, 'Failed to read request body')
  }
}

/**
 * Validate request HTTP method
 * @param req - Request object
 * @param allowedMethods - Array of allowed HTTP methods
 * @throws RequestError if method not allowed
 */
export function validateMethod(
  req: Request,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(req.method)) {
    throw new RequestError(
      405,
      `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
    )
  }
}

/**
 * Get request origin from headers
 * @param req - Request object
 * @returns Origin header value or null
 */
export function getOrigin(req: Request): string | null {
  return req.headers.get('origin')
}

/**
 * Get request signature from headers (for webhooks)
 * @param req - Request object
 * @param headerName - Name of the signature header
 * @returns Signature value or null
 */
export function getSignature(req: Request, headerName: string = 'stripe-signature'): string | null {
  return req.headers.get(headerName)
}

/**
 * Validate required fields in request body
 * @param body - Request body object
 * @param requiredFields - Array of required field names
 * @throws RequestError if any required field is missing
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => {
    const value = body[field]
    return value === null || value === undefined || value === ''
  })

  if (missing.length > 0) {
    throw new RequestError(
      400,
      `Missing required fields: ${missing.join(', ')}`
    )
  }
}

/**
 * Validate field types in request body
 * @param body - Request body object
 * @param fieldTypes - Object mapping field names to expected types
 * @throws RequestError if any field has wrong type
 */
export function validateFieldTypes(
  body: Record<string, any>,
  fieldTypes: Record<string, string>
): void {
  const invalid: string[] = []

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    const value = body[field]
    const actualType = typeof value

    if (value !== undefined && value !== null && actualType !== expectedType) {
      invalid.push(`${field} (expected ${expectedType}, got ${actualType})`)
    }
  }

  if (invalid.length > 0) {
    throw new RequestError(400, `Invalid field types: ${invalid.join(', ')}`)
  }
}

/**
 * Parse and validate JSON request body
 * @param req - Request object
 * @param requiredFields - Optional array of required field names
 * @param fieldTypes - Optional object mapping field names to expected types
 * @returns Parsed and validated request body
 * @throws RequestError if parsing or validation fails
 */
export async function parseAndValidate<T extends Record<string, any>>(
  req: Request,
  requiredFields?: string[],
  fieldTypes?: Record<string, string>
): Promise<T> {
  const body = await parseJSON<T>(req)

  if (requiredFields) {
    validateRequiredFields(body, requiredFields)
  }

  if (fieldTypes) {
    validateFieldTypes(body, fieldTypes)
  }

  return body
}
