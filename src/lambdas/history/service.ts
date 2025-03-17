import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@aws-sdk/credential-providers'
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb'

import { User, SearchHistory } from './models'

export class HistoryService {
  private readonly client: DynamoDBDocumentClient
  private readonly historyTable: string
  private readonly userTable: string

  constructor(region: string = process.env.AWS_REGION || 'eu-west-2') {
    const baseClient = new DynamoDBClient({
      region,
      credentials: fromEnv()
    })

    this.client = DynamoDBDocumentClient.from(baseClient)
    this.historyTable =
      process.env.DYNAMODB_HISTORY_TABLE_NAME || 'wb-api-history'
    this.userTable = process.env.DYNAMODB_USER_TABLE_NAME || 'wb-api-users'
  }

  async getUserId(userEmail: string): Promise<string> {
    try {
      const command = new GetCommand({
        TableName: this.userTable,
        Key: { email: userEmail }
      })

      const response = await this.client.send(command)

      if (!response.Item) {
        throw new Error(`User with email: ${userEmail} not found`)
      }

      const user = response.Item as User

      console.log(user.userId)
      return user.userId
    } catch (error) {
      console.log('Could not retrieve user ID from email', error)
      throw error
    }
  }

  async getUserHistory(userId: string): Promise<SearchHistory[]> {
    try {
      const command = new QueryCommand({
        TableName: this.historyTable,
        ExpressionAttributeValues: {
          ':userId': userId
        },
        KeyConditionExpression: 'userId = :userId'
      })

      const result = await this.client.send(command)

      if (!result.Items || result.Items.length === 0) {
        console.log('No history for this user')
        return []
      }

      return result.Items as SearchHistory[]
    } catch (error) {
      console.log('Could not retrieve user history', error)
      throw error
    }
  }
}
