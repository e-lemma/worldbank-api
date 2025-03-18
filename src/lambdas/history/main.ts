import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { configDotenv } from 'dotenv'

import { AccessKeyRetriever } from '../api_key_retriever'
import { UserService, HistoryService } from './services'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    configDotenv()

    const apiKey = event.queryStringParameters?.api_key
    if (!apiKey || apiKey !== (await AccessKeyRetriever.retrieveApiKey())) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorised',
          message: 'Missing or invalid API key'
        })
      }
    }
    const userEmail = event.queryStringParameters?.email
    const userPass = event.queryStringParameters?.password
    const userService = new UserService(process.env.AWS_REGION)
    if (
      !userEmail ||
      !userPass ||
      !(await userService.authenticateCredentials(userEmail, userPass))
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorised',
          message: 'Missing or invalid account credentials'
        })
      }
    }
    const historyService = new HistoryService(process.env.AWS_REGION)
    const matchingUserId = await historyService.getUserId(userEmail)
    const historyData = historyService.getUserHistory(matchingUserId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: historyData
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
