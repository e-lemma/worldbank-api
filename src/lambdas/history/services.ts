import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@aws-sdk/credential-providers'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

import { SearchHistory } from './models'

export class HistoryService {
  private readonly client: DynamoDBDocumentClient
  private readonly historyTable: string

  constructor(region: string = process.env.AWS_REGION || 'eu-west-2') {
    const baseClient = new DynamoDBClient({
      region,
      credentials: fromEnv()
    })

    this.client = DynamoDBDocumentClient.from(baseClient)
    this.historyTable =
      process.env.DYNAMODB_HISTORY_TABLE_NAME || 'wb-api-history'
  }

  async getUserHistory(accessToken: string): Promise<SearchHistory[]> {
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

      return result.Items as SearchHistory[]
    } catch (error) {
      console.log('Could not retrieve user history', error)
      throw error
    }
  }
}
