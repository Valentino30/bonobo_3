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
  try {
    // Get Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    })

    const prompt = `You are an expert relationship counselor analyzing a WhatsApp chat conversation. Analyze the following chat and provide detailed insights in JSON format.

Chat content:
${chatText}

Provide a detailed analysis with the following structure (respond ONLY with valid JSON):
{
  "redFlags": {
    "count": <number>,
    "items": [<array of specific red flag observations, max 4>]
  },
  "greenFlags": {
    "count": <number>,
    "items": [<array of specific green flag observations, max 4>]
  },
  "attachmentStyle": {
    "type": "<Secure/Anxious/Avoidant/Fearful>",
    "description": "<brief description>",
    "items": [<array of 3 supporting observations>]
  },
  "reciprocityScore": {
    "percentage": <0-100>,
    "rating": "<Poor/Fair/Good/Excellent>"
  },
  "compliments": {
    "count": <total number>,
    "breakdown": [<array of categorized compliments with counts>]
  },
  "criticism": {
    "count": <total number>,
    "breakdown": [<array of categorized criticism with counts>]
  },
  "compatibilityScore": {
    "percentage": <0-100>,
    "rating": "<Low/Moderate/High/Very High/Excellent>"
  },
  "relationshipTips": {
    "count": <number>,
    "tips": [<array of 4 specific actionable tips>]
  }
}

Focus on communication patterns, emotional dynamics, and relationship health indicators.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text) {
      throw new Error('No response from AI')
    }

    const insights: AIInsights = JSON.parse(text)
    return insights
  } catch (error) {
    console.error('AI Analysis error:', error)
    throw new Error('Failed to analyze chat with AI')
  }
}
