import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromEnv } from '@aws-sdk/credential-providers'
import dotenv from 'dotenv'

dotenv.config()

const REGION = process.env.AWS_REGION || 'eu-west-2'
const TABLE_NAME = process.env.DYNAMODB_HISTORY_TABLE_NAME || 'wb-api-history'

const client = new DynamoDBClient({
  region: REGION,
  credentials: fromEnv()
})

const main = async () => {
  const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'timestamp',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'timestamp',
        KeyType: 'RANGE'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  })

  try {
    const response = await client.send(command)
    console.log(`Table "${TABLE_NAME}" created successfully:`, response)
    return response
  } catch (error) {
    console.error('Error creating table:', error)
    throw error
  }
}

main()
