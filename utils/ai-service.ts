import { GoogleGenerativeAI } from '@google/generative-ai'
import i18n from '@/i18n/config'

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '')

export interface AIInsights {
  redFlags: {
    count: number
    description: string
    items: string[]
  }
  greenFlags: {
    count: number
    description: string
    items: string[]
  }
  attachmentStyle: {
    type: string
    description: string
    items: string[]
  }
  reciprocityScore: {
    percentage: number
    rating: string
    description: string
    items: string[]
  }
  compliments: {
    count: number
    description: string
    items: string[]
  }
  criticism: {
    count: number
    description: string
    items: string[]
  }
  compatibilityScore: {
    percentage: number
    rating: string
    description: string
    items: string[]
  }
  relationshipTips: {
    count: number
    description: string
    tips: string[]
  }
  conflictResolution: {
    type: string
    description: string
    items: string[]
  }
  sharedInterests: {
    count: number
    description: string
    items: string[]
  }
  weVsIRatio: {
    percentage: number
    rating: string
    description: string
    items: string[]
  }
  loveLanguage: {
    primary: string
    secondary: string
    description: string
    items: string[]
  }
}

export async function analyzeChat(chatText: string): Promise<AIInsights> {
  console.log('🤖 Starting AI analysis...')
  console.log('API Key present:', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY)
  console.log('Chat text length:', chatText.length)
  console.log('📝 Using locale for AI analysis:', i18n.locale)

  // Get all language-specific values from i18n
  const languageName = i18n.t('aiPrompt.languageName')
  const languageInstruction = i18n.t('aiPrompt.languageInstruction')

  // Get the actual tag values in the current language
  const attachmentStyleValues = i18n.t('aiPrompt.attachmentStyleValues')
  const reciprocityValues = i18n.t('aiPrompt.reciprocityValues')
  const compatibilityValues = i18n.t('aiPrompt.compatibilityValues')
  const conflictTypeValues = i18n.t('aiPrompt.conflictTypeValues')
  const weVsIValues = i18n.t('aiPrompt.weVsIValues')
  const loveLanguageValues = i18n.t('aiPrompt.loveLanguageValues')

  // Add timeout to prevent infinite hanging
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI request timed out after 30 seconds')), 30000)
  })

  try {
    // Get Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    })

    console.log('📤 Sending request to Gemini...')

    const prompt = `You are an expert relationship counselor analyzing a WhatsApp chat conversation. Analyze the following chat and provide detailed insights in JSON format.

${languageInstruction}

Chat content:
${chatText.substring(0, 10000)} ${chatText.length > 10000 ? '...(truncated)' : ''}

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
    "type": "<MUST be one of: ${attachmentStyleValues}>",
    "description": "<AI-generated explanation in ${languageName}>",
    "items": [<array of 3 supporting observations in ${languageName}>]
  },
  "reciprocityScore": {
    "percentage": <0-100>,
    "rating": "<MUST be one of: ${reciprocityValues}>",
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
    "rating": "<MUST be one of: ${compatibilityValues}>",
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3 specific observations in ${languageName}>]
  },
  "relationshipTips": {
    "count": <number>,
    "description": "<AI-generated intro in ${languageName}>",
    "tips": [<array of 4 actionable tips in ${languageName}>]
  },
  "conflictResolution": {
    "type": "<MUST be one of: ${conflictTypeValues}>",
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
    "rating": "<MUST be one of: ${weVsIValues}>",
    "description": "<AI-generated summary in ${languageName}>",
    "items": [<array of 3 observations in ${languageName}>]
  },
  "loveLanguage": {
    "primary": "<MUST be one of: ${loveLanguageValues}>",
    "secondary": "<MUST be one of: ${loveLanguageValues}>",
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
2. The "type" and "rating" fields use ONLY the exact values listed above (e.g., attachmentStyle.type MUST be one of: ${attachmentStyleValues})
3. Check these critical fields: attachmentStyle.type, reciprocityScore.rating, compatibilityScore.rating, conflictResolution.type, weVsIRatio.rating, loveLanguage.primary, loveLanguage.secondary`

    const generatePromise = model.generateContent(prompt)
    const result = (await Promise.race([generatePromise, timeoutPromise])) as any

    console.log('📥 Received response from Gemini')

    const response = result.response
    const text = response.text()

    console.log('Response text length:', text?.length || 0)

    if (!text) {
      throw new Error('No response from AI')
    }

    // Clean the text to extract JSON
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

    console.log('Attempting to parse JSON, length:', cleanText.length)

    let rawInsights: AIInsights
    try {
      rawInsights = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('JSON Parse error:', parseError)
      console.error('Problematic text (first 500 chars):', cleanText.substring(0, 500))
      console.error('Problematic text (last 500 chars):', cleanText.substring(Math.max(0, cleanText.length - 500)))

      // Try one more time with even more aggressive cleaning
      try {
        // Remove all non-printable characters except standard whitespace
        const ultraClean = cleanText.replace(/[^\x20-\x7E\n\r\t]/g, '')
        rawInsights = JSON.parse(ultraClean)
        console.log('✅ Parsed with ultra-clean method')
      } catch {
        throw new Error(
          `Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`
        )
      }
    }

    // Normalize arrays to ensure they only contain strings
    const normalizeArray = (arr: any[]): string[] => {
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

    // Ensure description is a string
    const normalizeDescription = (desc: any): string => {
      if (typeof desc === 'string') {
        return desc
      }
      if (typeof desc === 'object' && desc !== null) {
        return JSON.stringify(desc)
      }
      return String(desc)
    }

    // Normalize all arrays in the response
    const insights: AIInsights = {
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

    console.log('✅ AI analysis complete!')
    return insights
  } catch (error) {
    console.error('❌ AI Analysis error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw new Error(`Failed to analyze chat with AI: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
