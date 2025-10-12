export interface ShareIntentData {
  text?: string
  type?: string
  action?: string
  webUrl?: string
  files?: string[]
}

export interface ShareIntentResult {
  hasIntent: boolean
  data: ShareIntentData | null
}
