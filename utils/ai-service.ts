import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '')

export interface AIInsights {
  redFlags: {
    count: number
    items: string[]
  }
  greenFlags: {
    count: number
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
  }
  compliments: {
    count: number
    breakdown: string[]
  }
  criticism: {
    count: number
    breakdown: string[]
  }
  compatibilityScore: {
    percentage: number
    rating: string
  }
  relationshipTips: {
    count: number
    tips: string[]
  }
}

export async function analyzeChat(chatText: string): Promise<AIInsights> {
  console.log('🤖 Starting AI analysis...')
  console.log('API Key present:', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY)
  console.log('Chat text length:', chatText.length)

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

Chat content:
${chatText.substring(0, 10000)} ${chatText.length > 10000 ? '...(truncated)' : ''}

Provide a detailed analysis with the following structure (respond ONLY with valid JSON):
{
  "redFlags": {
    "count": <number>,
    "items": [<array of SIMPLE STRING observations, max 4, e.g. "Delayed responses during important discussions">]
  },
  "greenFlags": {
    "count": <number>,
    "items": [<array of SIMPLE STRING observations, max 4, e.g. "Regular check-ins and thoughtful questions">]
  },
  "attachmentStyle": {
    "type": "<Secure/Anxious/Avoidant/Fearful>",
    "description": "<brief SIMPLE STRING description>",
    "items": [<array of 3 SIMPLE STRING supporting observations>]
  },
  "reciprocityScore": {
    "percentage": <0-100>,
    "rating": "<Poor/Fair/Good/Excellent>"
  },
  "compliments": {
    "count": <total number>,
    "breakdown": [<array of SIMPLE STRINGS like "Appearance compliments: 8", "Character compliments: 12">]
  },
  "criticism": {
    "count": <total number>,
    "breakdown": [<array of SIMPLE STRINGS like "Constructive feedback: 2", "Harsh criticism: 0">]
  },
  "compatibilityScore": {
    "percentage": <0-100>,
    "rating": "<Low/Moderate/High/Very High/Excellent>"
  },
  "relationshipTips": {
    "count": <number>,
    "tips": [<array of 4 SIMPLE STRING actionable tips>]
  }
}

IMPORTANT: All "items", "breakdown", and "tips" arrays must contain ONLY simple text strings, NOT objects. Each item should be a complete sentence or phrase as a string.

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

    const rawInsights: AIInsights = JSON.parse(text)

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
        items: normalizeArray(rawInsights.redFlags.items),
      },
      greenFlags: {
        ...rawInsights.greenFlags,
        items: normalizeArray(rawInsights.greenFlags.items),
      },
      attachmentStyle: {
        ...rawInsights.attachmentStyle,
        description: normalizeDescription(rawInsights.attachmentStyle.description),
        items: normalizeArray(rawInsights.attachmentStyle.items),
      },
      compliments: {
        ...rawInsights.compliments,
        breakdown: normalizeArray(rawInsights.compliments.breakdown),
      },
      criticism: {
        ...rawInsights.criticism,
        breakdown: normalizeArray(rawInsights.criticism.breakdown),
      },
      relationshipTips: {
        ...rawInsights.relationshipTips,
        tips: normalizeArray(rawInsights.relationshipTips.tips),
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
