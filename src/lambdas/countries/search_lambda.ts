import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb"
import { Handler, APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters} from 'aws-lambda'
import dotenv from 'dotenv'

dotenv.config()
const mockRequest = {resource: '/pets/search',
path: '/pets/search',
httpMethod: 'GET',
headers: 
{ Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
'Accept-Encoding': 'gzip, deflate, br',
'Accept-Language': 'en-US,en;q=0.9',
Host: 'xyz.execute-api.us-east-1.amazonaws.com',
'Upgrade-Insecure-Requests': '1',
'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
Via: '1.1 382909590d138901660243559bc5e346.cloudfront.net (CloudFront)',
'X-Amz-Cf-Id': 'motXi0bgd4RyV--wvyJnKpJhLdgp9YEo7_9NeS4L6cbgHkWkbn0KuQ==',
'X-Amzn-Trace-Id': 'Root=1-5bab7b8b-f1333fbc610288d200cd6224',
'X-Forwarded-Proto': 'https' },
queryStringParameters: {IndicatorCode: "NY.ADJ.DFOR.CD", Year: "2013"},
multiValueQueryStringParameters: { CountryCode: [ 'MDG', 'RUS' ] },
pathParameters: null,
stageVariables: null,
requestContext: 
{ resourceId: 'jy2rzf',
resourcePath: '/pets/search',
httpMethod: 'GET',
extendedRequestId: 'N1A9yGxUoAMFWMA=',
requestTime: '26/Sep/2018:12:28:59 +0000',
path: '/staging/pets/search',
protocol: 'HTTP/1.1',
stage: 'staging',
requestTimeEpoch: 1537964939459,
requestId: 'be70816e-c187-11e8-9d99-eb43dd4b0381',
apiId: 'xxxx' },
body: null,
isBase64Encoded: false }

export const handler: Handler =  async(event: APIGatewayProxyEvent) => {
    try {
        const parameters = mockRequest.multiValueQueryStringParameters
        const countryData = []
        for (const country in parameters)
            console.log(country)

    } catch (error) {
        return null
    }
}

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

async function main(){
    const docClient = connectToClient()
    const countries = mockRequest.multiValueQueryStringParameters.CountryCode
    const parameters = mockRequest.queryStringParameters
    const data = []
    for (const country of countries) {
        Object.assign(parameters, {CountryCode: country})
        const countryData = await scanCountryIndicators(parameters, docClient)
        data.push(countryData)
        
    }
    console.log(data.flat())

}

main()



