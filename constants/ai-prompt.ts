/**
 * AI Analysis Prompt Constants
 * These define the structure and instructions for the AI relationship analysis
 */

// Tag values for AI responses (always in English for consistency)
export const AI_TAG_VALUES = {
  attachmentStyle: 'Secure/Anxious/Avoidant/Fearful',
  reciprocity: 'Poor/Fair/Good/Excellent',
  compatibility: 'Low/Moderate/High/Very High/Excellent',
  conflictType: 'Collaborative/Competitive/Accommodating/Avoiding/Compromising',
  weVsI: 'Low/Moderate/High/Very High',
  loveLanguage: 'Words of Affirmation/Quality Time/Physical Touch/Acts of Service/Receiving Gifts',
} as const

/**
 * Build the AI analysis prompt
 * @param chatText - The chat text to analyze (will be truncated if too long)
 * @param languageName - The language for AI to respond in (e.g., "English", "Italian")
 */
export function buildAnalysisPrompt(chatText: string, languageName: string): string {
  const truncatedChat = chatText.substring(0, 10000)
  const truncationNote = chatText.length > 10000 ? '...(truncated)' : ''

  return `You are an expert relationship counselor analyzing a WhatsApp chat conversation. Analyze the following chat and provide detailed insights in JSON format.

CRITICAL: Your ENTIRE JSON response MUST be 100% in ${languageName}. Every single field, value, description, item, and tip must be written in ${languageName}. You must use ONLY the exact tag values specified below for "type" and "rating" fields.

Chat content:
${truncatedChat} ${truncationNote}

Provide a detailed analysis with the following structure (respond ONLY with valid JSON):
{
  "redFlags": {
    "count": <number>,
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3-4 specific examples in ${languageName}>]
  },
  "greenFlags": {
    "count": <number>,
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3-4 specific examples in ${languageName}>]
  },
  "attachmentStyle": {
    "type": "<MUST be one of: ${AI_TAG_VALUES.attachmentStyle}>",
    "description": "<AI-generated explanation in ${languageName}>",
    "items": [<array of 3 supporting observations in ${languageName}>]
  },
  "reciprocityScore": {
    "percentage": <0-100>,
    "rating": "<MUST be one of: ${AI_TAG_VALUES.reciprocity}>",
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3 specific examples in ${languageName}>]
  },
  "compliments": {
    "count": <total number>,
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3-4 observations in ${languageName}>]
  },
  "criticism": {
    "count": <total number>,
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3-4 observations in ${languageName}>]
  },
  "compatibilityScore": {
    "percentage": <0-100>,
    "rating": "<MUST be one of: ${AI_TAG_VALUES.compatibility}>",
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3 specific observations in ${languageName}>]
  },
  "relationshipTips": {
    "count": <number>,
    "description": "<AI-generated intro in ${languageName}>",
    "tips": [<array of 4 actionable tips in ${languageName}>]
  },
  "conflictResolution": {
    "type": "<MUST be one of: ${AI_TAG_VALUES.conflictType}>",
    "description": "<AI-generated explanation in ${languageName}>",
    "items": [<array of 3 specific examples in ${languageName}>]
  },
  "sharedInterests": {
    "count": <number of distinct shared interests>,
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3-5 specific shared interests in ${languageName}>]
  },
  "weVsIRatio": {
    "percentage": <0-100, percentage of "we" language vs "I" language>,
    "rating": "<MUST be one of: ${AI_TAG_VALUES.weVsI}>",
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3 observations in ${languageName}>]
  },
  "loveLanguage": {
    "primary": "<MUST be one of: ${AI_TAG_VALUES.loveLanguage}>",
    "secondary": "<MUST be one of: ${AI_TAG_VALUES.loveLanguage}>",
    "description": "<AI-generated explanation in ${languageName}>",
    "items": [<array of 3 specific examples in ${languageName}>]
  }
}

IMPORTANT:
- All "items", "tips" arrays must contain ONLY simple text strings, NOT objects
- Each item should be a complete sentence or phrase as a string
- Do NOT include direct quotes from the conversation - instead describe patterns and themes
- Focus on communication patterns, emotional dynamics, and relationship health indicators

FINAL CHECK BEFORE SUBMISSION:
Review EVERY field value and verify:
1. ALL text is in ${languageName}
2. The "type" and "rating" fields use ONLY the exact values listed above (e.g., attachmentStyle.type MUST be one of: ${AI_TAG_VALUES.attachmentStyle})
3. Check these critical fields: attachmentStyle.type, reciprocityScore.rating, compatibilityScore.rating, conflictResolution.type, weVsIRatio.rating, loveLanguage.primary, loveLanguage.secondary`
}
