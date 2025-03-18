export interface SearchHistory {
  userId: string // Partition key
  timestamp: string // Sort key
  queryType: string
  parameters: Record<string, string[]> // Countries, Indicators
}

export interface User {
  email: string // Partition Key
  userId: string
  password: string
  createdAt: string
}
