/**
 * AI Response Normalization Utilities
 * Ensures AI responses conform to expected format
 */

/**
 * Normalize array values to ensure they only contain strings
 * Handles cases where AI returns objects or other types
 */
export function normalizeArray(arr: any[]): string[] {
  return arr.map((item) => {
    if (typeof item === 'string') {
      return item
    } else if (typeof item === 'object' && item !== null) {
      // Convert objects like {category: "Appearance", count: 8} to "Appearance: 8"
      if ('category' in item && 'count' in item) {
        return `${item.category}: ${item.count}`
      }
      // For other objects, create a readable string
      return Object.entries(item)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    }
    return String(item)
  })
}

/**
 * Ensure description is a string
 * Handles cases where AI returns non-string values
 */
export function normalizeDescription(desc: any): string {
  if (typeof desc === 'string') {
    return desc
  }
  if (typeof desc === 'object' && desc !== null) {
    return JSON.stringify(desc)
  }
  return String(desc)
}

/**
 * Clean JSON text from AI response
 * Removes markdown code blocks, control characters, etc.
 */
export function cleanAIJsonResponse(text: string): string {
  let cleanText = text.trim()

  // Remove markdown code blocks if present
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '')
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '')
  }

  // Try to find JSON object if text contains other content
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleanText = jsonMatch[0]
  }

  // Remove any invisible/control characters except newlines, spaces, tabs
  cleanText = cleanText.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')

  // Remove any zero-width characters
  cleanText = cleanText.replace(/[\u200B-\u200D\uFEFF]/g, '')

  return cleanText
}

/**
 * Parse JSON with fallback for aggressive cleaning
 */
export function parseAIJsonResponse(text: string): any {
  const cleanText = cleanAIJsonResponse(text)

  try {
    return JSON.parse(cleanText)
  } catch (parseError) {
    console.error('JSON Parse error:', parseError)
    console.error('Problematic text (first 500 chars):', cleanText.substring(0, 500))
    console.error('Problematic text (last 500 chars):', cleanText.substring(Math.max(0, cleanText.length - 500)))

    // Try one more time with even more aggressive cleaning
    try {
      // Remove all non-printable characters except standard whitespace
      const ultraClean = cleanText.replace(/[^\x20-\x7E\n\r\t]/g, '')
      return JSON.parse(ultraClean)
    } catch {
      throw new Error(
        `Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`
      )
    }
  }
}

/**
 * Normalize the entire AIInsights response
 * Ensures all descriptions are strings and all arrays contain only strings
 */
export function normalizeAIInsights(rawInsights: any): any {
  return {
    ...rawInsights,
    redFlags: {
      ...rawInsights.redFlags,
      description: normalizeDescription(rawInsights.redFlags.description),
      items: normalizeArray(rawInsights.redFlags.items),
    },
    greenFlags: {
      ...rawInsights.greenFlags,
      description: normalizeDescription(rawInsights.greenFlags.description),
      items: normalizeArray(rawInsights.greenFlags.items),
    },
    attachmentStyle: {
      ...rawInsights.attachmentStyle,
      description: normalizeDescription(rawInsights.attachmentStyle.description),
      items: normalizeArray(rawInsights.attachmentStyle.items),
    },
    reciprocityScore: {
      ...rawInsights.reciprocityScore,
      description: normalizeDescription(rawInsights.reciprocityScore.description),
      items: normalizeArray(rawInsights.reciprocityScore.items),
    },
    compliments: {
      ...rawInsights.compliments,
      description: normalizeDescription(rawInsights.compliments.description),
      items: normalizeArray((rawInsights.compliments as any).items || (rawInsights.compliments as any).breakdown),
    },
    criticism: {
      ...rawInsights.criticism,
      description: normalizeDescription(rawInsights.criticism.description),
      items: normalizeArray((rawInsights.criticism as any).items || (rawInsights.criticism as any).breakdown),
    },
    compatibilityScore: {
      ...rawInsights.compatibilityScore,
      description: normalizeDescription(rawInsights.compatibilityScore.description),
      items: normalizeArray(rawInsights.compatibilityScore.items),
    },
    relationshipTips: {
      ...rawInsights.relationshipTips,
      description: normalizeDescription(rawInsights.relationshipTips.description),
      tips: normalizeArray(rawInsights.relationshipTips.tips),
    },
    conflictResolution: {
      ...rawInsights.conflictResolution,
      description: normalizeDescription(rawInsights.conflictResolution.description),
      items: normalizeArray(rawInsights.conflictResolution.items),
    },
    sharedInterests: {
      ...rawInsights.sharedInterests,
      description: normalizeDescription(rawInsights.sharedInterests.description),
      items: normalizeArray(rawInsights.sharedInterests.items),
    },
    weVsIRatio: {
      ...rawInsights.weVsIRatio,
      description: normalizeDescription(rawInsights.weVsIRatio.description),
      items: normalizeArray(rawInsights.weVsIRatio.items),
    },
    loveLanguage: {
      ...rawInsights.loveLanguage,
      description: normalizeDescription(rawInsights.loveLanguage.description),
      items: normalizeArray(rawInsights.loveLanguage.items),
    },
  }
}
