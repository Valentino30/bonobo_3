export interface ShareIntentData {
  text?: string
  type?: string
  action?: string
}

export interface ShareIntentResult {
  hasIntent: boolean
  data: ShareIntentData | null
}
