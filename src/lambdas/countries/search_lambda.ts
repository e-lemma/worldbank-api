import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb"
import { Handler, APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters} from 'aws-lambda'
import dotenv from 'dotenv'

dotenv.config()
function connectToClient(){
    const client = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    })

    const docClient = DynamoDBDocumentClient.from(client)

    return docClient
}
async function scanCountryIndicators(filters: APIGatewayProxyEventQueryStringParameters, docClient: DynamoDBDocumentClient) {
  const filterExpressions: string[] = []
  const expressionAttributeValues: Record<string, unknown> = {}
  const expressionAttributeNames: Record<string, string> = {}

  Object.entries(filters).forEach(([key, value], index) => {
    if (value === undefined) return
    const placeholder = `:val${index}`
    
    if (key.toLowerCase() === "year") {
      const alias = "#yr"
      filterExpressions.push(`${alias} = ${placeholder}`)
      expressionAttributeNames[alias] = "Year"
      expressionAttributeValues[placeholder] = parseInt(value, 10)
    } else {
      filterExpressions.push(`${key} = ${placeholder}`)
      expressionAttributeValues[placeholder] = value
    }

  })

  const filterExpression = filterExpressions.join(" AND ")

  const command = new ScanCommand({
    TableName: "Country_Indicators",
    ...(filterExpression && { FilterExpression: filterExpression }),
    ...(Object.keys(expressionAttributeValues).length > 0 && {
      ExpressionAttributeValues: expressionAttributeValues,
    }),
    ...(Object.keys(expressionAttributeNames).length > 0 && {
      ExpressionAttributeNames: expressionAttributeNames,
    }),
  })

  const response = await docClient.send(command)
  return response.Items
}

export const handler: Handler =  async(event: APIGatewayProxyEvent) => {
    try {
        const docClient = connectToClient()
        const countries = event.multiValueQueryStringParameters?.CountryCode
        const parameters = event.queryStringParameters!
        const data = []
        if (countries) {
            for (const country of countries) {
            const countryParams = { ...parameters, CountryCode: country }
            const countryData = await scanCountryIndicators(countryParams, docClient)
            data.push(countryData)
            }
        } else {
            const countryData = await scanCountryIndicators(parameters, docClient)
            data.push(countryData)
        }
       return {
            statusCode: 200,
            body: JSON.stringify(data.flat()),
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error }),
        }
    }
}




