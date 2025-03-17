export class SearchHistory {
  userId: string // Partition key
  timestamp: string // Sort key
  queryType: string
  parameters: Record<string, string[]> // Countries, Indicators

  constructor(data: {
    userId: string
    timestamp: string
    queryType: string
    parameters: Record<string, string[]>
  }) {
    this.userId = data.userId
    this.timestamp = data.timestamp
    this.queryType = data.queryType
    this.parameters = data.parameters
  }
}

export class User {
  email: string // Partition Key
  userId: string
  password: string
  lastLogin: string
  createdAt: string

  constructor(data: {
    email: string
    userId: string
    password: string
    lastLogin: string
    createdAt: string
  }) {
    this.email = data.email
    this.userId = data.userId
    this.password = data.password
    this.lastLogin = data.lastLogin
    this.createdAt = data.createdAt
  }
}
