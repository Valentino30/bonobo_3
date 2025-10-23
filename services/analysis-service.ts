import { GoogleGenerativeAI } from '@google/generative-ai'
import i18n from '@/i18n/config'
import { buildAnalysisPrompt } from '@/constants/ai-prompt'
import { normalizeAIInsights, parseAIJsonResponse } from '@/utils/ai-response-normalizer'

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

  // Determine output language based on user's locale
  const languageName = i18n.locale === 'it' ? 'Italian' : 'English'

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

    const prompt = buildAnalysisPrompt(chatText, languageName)

    const generatePromise = model.generateContent(prompt)
    const result = (await Promise.race([generatePromise, timeoutPromise])) as any

    console.log('📥 Received response from Gemini')

    const response = result.response
    const text = response.text()

    console.log('Response text length:', text?.length || 0)

    if (!text) {
      throw new Error('No response from AI')
    }

    console.log('Attempting to parse JSON...')
    const rawInsights: AIInsights = parseAIJsonResponse(text)
    const insights: AIInsights = normalizeAIInsights(rawInsights)

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
