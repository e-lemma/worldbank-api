import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda'

class Search {
  accessToken: string
  timestamp: string
  parameters: APIGatewayProxyEventQueryStringParameters

  constructor(
    accessToken: string,
    timestamp: string,
    parameters: APIGatewayProxyEventQueryStringParameters
  ) {
    this.accessToken = accessToken
    this.timestamp = timestamp
    this.parameters = parameters
  }
}

export { Search }
