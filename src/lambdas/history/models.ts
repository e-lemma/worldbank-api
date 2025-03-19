export interface SearchHistory {
  accessToken: string // Partition key
  timestamp: string // Sort key
  queryType: string
  parameters: Record<string, string[]> // Countries, Indicators
}

export type PublicSearchHistory = Omit<SearchHistory, 'accessToken'>
