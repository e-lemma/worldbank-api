import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { configDotenv } from 'dotenv'

import { HistoryService } from './services'

configDotenv()

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const historyService = new HistoryService(process.env.AWS_REGION)

    const accessToken = event.queryStringParameters?.access_token
    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorised',
          message: 'Missing access token'
        })
      }
    }

    if (!(await historyService.isValidToken(accessToken))) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorised',
          message: 'Invalid access token'
        })
      }
    }

    const historyData = await historyService.getUserHistory(accessToken)
    return {
      statusCode: 200,
      body: JSON.stringify(historyData)
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
