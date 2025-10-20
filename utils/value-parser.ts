/**
 * Parsed value with optional number and unit separation
 * e.g., "123 words" -> { hasUnit: true, number: "123", unit: "words" }
 */
export interface ParsedValue {
  hasUnit: boolean
  number?: string
  unit?: string
  fullValue: string | number
}

/**
 * Parses a value that may contain a number followed by a unit (e.g., "123 words")
 * Separates the numeric part from the unit text for flexible rendering
 *
 * @param value - The value to parse (string or number)
 * @returns Parsed value object with optional number/unit separation
 *
 * @example
 * parseNumberWithUnit("123 words") // { hasUnit: true, number: "123", unit: "words", fullValue: "123 words" }
 * parseNumberWithUnit("Hello") // { hasUnit: false, fullValue: "Hello" }
 * parseNumberWithUnit(42) // { hasUnit: false, fullValue: 42 }
 */
export function parseNumberWithUnit(value: string | number): ParsedValue {
  const valueString = String(value)
  const match = valueString.match(/^(\d+)\s+(.+)$/)

  if (match) {
    return {
      hasUnit: true,
      number: match[1],
      unit: match[2],
      fullValue: value,
    }
  }

  return {
    hasUnit: false,
    fullValue: value,
  }
}
