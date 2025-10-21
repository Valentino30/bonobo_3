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

  // Use current app locale for AI analysis
  const currentLocale = i18n.locale
  console.log('📝 Using locale for AI analysis:', currentLocale)

  // Language-specific instructions and field examples
  const languageInstruction =
    currentLocale === 'it'
      ? 'IMPORTANTE: Rispondi in ITALIANO. Tutte le descrizioni, items, tips, e valori dei campi type/rating devono essere in italiano.'
      : 'IMPORTANT: Respond in ENGLISH. All descriptions, items, tips, and type/rating field values must be in English.'

  // Language-specific field value examples
  const attachmentStyleTypes =
    currentLocale === 'it' ? 'Sicuro/Ansioso/Evitante/Timoroso' : 'Secure/Anxious/Avoidant/Fearful'
  const reciprocityRatings = currentLocale === 'it' ? 'Scarso/Discreto/Buono/Eccellente' : 'Poor/Fair/Good/Excellent'
  const compatibilityRatings =
    currentLocale === 'it' ? 'Bassa/Moderata/Alta/Molto Alta/Eccellente' : 'Low/Moderate/High/Very High/Excellent'
  const conflictTypes =
    currentLocale === 'it'
      ? 'Collaborativo/Competitivo/Accomodante/Evitante/Compromissorio'
      : 'Collaborative/Competitive/Accommodating/Avoiding/Compromising'
  const weVsIRatings = currentLocale === 'it' ? 'Basso/Moderato/Alto/Molto Alto' : 'Low/Moderate/High/Very High'
  const loveLanguages =
    currentLocale === 'it'
      ? 'Parole di Affermazione/Tempo di Qualità/Contatto Fisico/Atti di Servizio/Ricevere Regali'
      : 'Words of Affirmation/Quality Time/Physical Touch/Acts of Service/Receiving Gifts'

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
    "description": "<AI-generated SIMPLE STRING summary of concerns>",
    "items": [<array of 3-4 SIMPLE STRING specific examples>]
  },
  "greenFlags": {
    "count": <number>,
    "description": "<AI-generated SIMPLE STRING summary of positives>",
    "items": [<array of 3-4 SIMPLE STRING specific examples>]
  },
  "attachmentStyle": {
    "type": "<${attachmentStyleTypes}>",
    "description": "<AI-generated SIMPLE STRING explanation of the attachment style based on this chat>",
    "items": [<array of 3 SIMPLE STRING supporting observations>]
  },
  "reciprocityScore": {
    "percentage": <0-100>,
    "rating": "<${reciprocityRatings}>",
    "description": "<AI-generated SIMPLE STRING summary of give-and-take balance>",
    "items": [<array of 3 SIMPLE STRING specific examples about balance>]
  },
  "compliments": {
    "count": <total number>,
    "description": "<AI-generated SIMPLE STRING summary of compliment patterns>",
    "items": [<array of 3-4 SIMPLE STRING observations about compliment themes>]
  },
  "criticism": {
    "count": <total number>,
    "description": "<AI-generated SIMPLE STRING summary of criticism patterns>",
    "items": [<array of 3-4 SIMPLE STRING observations about criticism themes>]
  },
  "compatibilityScore": {
    "percentage": <0-100>,
    "rating": "<${compatibilityRatings}>",
    "description": "<AI-generated SIMPLE STRING summary of compatibility>",
    "items": [<array of 3 SIMPLE STRING specific observations about compatibility>]
  },
  "relationshipTips": {
    "count": <number>,
    "description": "<AI-generated SIMPLE STRING intro to the tips>",
    "tips": [<array of 4 SIMPLE STRING actionable tips>]
  },
  "conflictResolution": {
    "type": "<${conflictTypes}>",
    "description": "<AI-generated SIMPLE STRING explanation of how conflicts are handled>",
    "items": [<array of 3 SIMPLE STRING specific examples of conflict resolution patterns>]
  },
  "sharedInterests": {
    "count": <number of distinct shared interests>,
    "description": "<AI-generated SIMPLE STRING summary of common interests and activities>",
    "items": [<array of 3-5 SIMPLE STRING specific shared interests mentioned>]
  },
  "weVsIRatio": {
    "percentage": <0-100, percentage of "we" language vs "I" language>,
    "rating": "<${weVsIRatings}>",
    "description": "<AI-generated SIMPLE STRING summary of collective vs individual language usage>",
    "items": [<array of 3 SIMPLE STRING observations about "we" vs "I" language patterns>]
  },
  "loveLanguage": {
    "primary": "<${loveLanguages}>",
    "secondary": "<${loveLanguages}>",
    "description": "<AI-generated SIMPLE STRING explanation of the dominant love language patterns>",
    "items": [<array of 3 SIMPLE STRING specific examples showing the love language>]
  }
}

IMPORTANT: All "items", "tips" arrays must contain ONLY simple text strings, NOT objects. Each item should be a complete sentence or phrase as a string. Do NOT include direct quotes from the conversation - instead describe patterns and themes you observe.

Focus on communication patterns, emotional dynamics, and relationship health indicators.`

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
