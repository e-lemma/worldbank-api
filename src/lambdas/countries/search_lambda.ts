import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, ScanCommand, PutCommand} from "@aws-sdk/lib-dynamodb"
import { Handler, APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters} from 'aws-lambda'
import dotenv from 'dotenv'

import { Search } from "./helpers"

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

async function addToHistory(userSearch: Search, queryType: string, docClient: DynamoDBClient) {
    const command = new PutCommand({
        TableName: "wb-api-history",
        Item: {
            accessToken: userSearch.accessToken,
            timestamp: userSearch.timestamp,
            parameters: userSearch.parameters,
            queryType: queryType

        }
    })
    const response = await docClient.send(command)
    return response

}

async function createSearch(
  accessToken: string,
  parameters: APIGatewayProxyEventQueryStringParameters,
  countryCodes?: string[]
) {
  const fullParams: APIGatewayProxyEventQueryStringParameters = { 
    ...parameters, 
    CountryCode: countryCodes?.length 
      ? countryCodes.join(",") 
      : parameters.CountryCode  
  }

  const searchDate = new Date().toISOString()
  const newSearch = new Search(accessToken, searchDate, fullParams)

  return newSearch
}

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
    const requestDate = new Date().toISOString()
    try {
        const docClient = connectToClient()
        if (!event.queryStringParameters) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing query parameters." }),
                date: requestDate,
            }
        }
        const parameters = { ...event.queryStringParameters }
        const accessToken = parameters["accessToken"]
        delete parameters["accessToken"]

        if (!accessToken) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Missing access token." }),
                date: requestDate,
            }
        }
        const countries = event.multiValueQueryStringParameters?.CountryCode

        const data = []

        if (countries && countries.length > 0) {
            for (const country of countries) {
                const countryParams = { ...parameters, CountryCode: country }
                const countryData = await scanCountryIndicators(countryParams, docClient)
                data.push(countryData)
            }
            const searchData: Search = await createSearch(accessToken, parameters, countries)
            await addToHistory(searchData, "comparison", docClient)


        } else {
            if (!parameters["CountryCode"]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Missing CountryCode parameter." }),
                    date: requestDate,
                }
            }

            const countryData = await scanCountryIndicators(parameters, docClient)
            data.push(countryData)

            const searchData: Search = await createSearch(accessToken, parameters)
            await addToHistory(searchData, "country_indicator", docClient)
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data.flat()),
            date: requestDate,
        }

    } catch (error) {
        console.error("Error processing request:", error)

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error),
            }),
            date: requestDate,
        }
    }
}
