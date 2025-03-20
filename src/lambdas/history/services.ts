import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@aws-sdk/credential-providers'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

import { SearchHistory, PublicSearchHistory } from './models'

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

  async isValidToken(accessToken: string): Promise<boolean> {
    const command = new QueryCommand({
      TableName: this.userTable,
      IndexName: 'accessToken-index',
      ExpressionAttributeValues: {
        ':accessToken': accessToken
      },
      KeyConditionExpression: 'accessToken = :accessToken'
    })

    const result = await this.client.send(command)

    return result.Items !== undefined && result.Items.length > 0
  }

  async getUserHistory(accessToken: string): Promise<PublicSearchHistory[]> {
    try {
      const command = new QueryCommand({
        TableName: this.historyTable,
        ExpressionAttributeValues: {
          ':accessToken': accessToken
        },
        KeyConditionExpression: 'accessToken = :accessToken'
      })

      const result = await this.client.send(command)

      if (!result.Items || result.Items.length === 0) {
        console.log('No history for this user')
        return []
      }

      const searchHistory: SearchHistory[] = result.Items.map((item) => ({
        accessToken: item.accessToken,
        timestamp: item.timestamp,
        queryType: item.queryType,
        parameters: item.parameters
      }))

      const cleanedHistory: PublicSearchHistory[] = searchHistory.map(
        ({ accessToken: _accessToken, ...rest }) => rest
      )

      return cleanedHistory
    } catch (error) {
      console.log('Could not retrieve user history', error)
      throw error
    }
  }
}
