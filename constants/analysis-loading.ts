export type LoadingStep = {
  title: string
  subtitle: string
  icon: 'message-processing' | 'chart-box' | 'brain'
}

/**
 * Loading steps shown during chat analysis
 * Each step displays for 1000ms with smooth transitions
 */
export const ANALYSIS_LOADING_STEPS: LoadingStep[] = [
  {
    title: 'Reading Messages',
    subtitle: 'Parsing conversation data',
    icon: 'message-processing',
  },
  {
    title: 'Calculating Stats',
    subtitle: 'Analyzing patterns',
    icon: 'chart-box',
  },
  {
    title: 'Generating Insights',
    subtitle: 'Preparing your results',
    icon: 'brain',
  },
]
