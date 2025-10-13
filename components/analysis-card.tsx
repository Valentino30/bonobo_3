import { ComparisonCard } from './comparison-card'
import { SimpleStatCard } from './simple-stat-card'

export function AnalysisCard({
  title,
  icon,
  participants,
  singleValue,
}: {
  title: string
  icon: string
  participants?: {
    name: string
    value: string | number
    progressValue?: number
    progressColor?: string
  }[]
  singleValue?: string | number
}) {
  if (singleValue !== undefined) {
    return <SimpleStatCard title={title} icon={icon} value={singleValue} />
  }
  return <ComparisonCard title={title} icon={icon} participants={participants || []} />
}
