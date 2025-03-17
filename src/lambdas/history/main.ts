import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'

export const handler = async (event: any) => {
  try {
    /**
     * get access key from query params
     * validate access key
     * get userid/user email from query params
     * validate userid/user email
     *  * get user id from user table via user email
 * use userid as history table pk to retrieve all data

     * get corresponding data from history table
     * return it
     */
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
