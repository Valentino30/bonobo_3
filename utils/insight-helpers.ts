export function getFrequencyLabel(count: number): string {
  if (count === 0) return 'None'
  if (count === 1) return 'Rare'
  if (count <= 3) return 'Few'
  if (count <= 7) return 'Occasional'
  if (count <= 15) return 'Moderate'
  if (count <= 25) return 'Frequent'
  return 'Very Frequent'
}
