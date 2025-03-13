export interface SearchHistory {
  userId: string // Partition key
  timestamp: string // Sort key
  queryType: string
  parameters: Record<string, string[]> // Countries, Indicators
  result: object
}
