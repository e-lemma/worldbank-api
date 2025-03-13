import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand} from "@aws-sdk/lib-dynamodb"
import dotenv from 'dotenv'
// import { Handler } from 'aws-lambda'

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
async function getCountry(search: string, docClient: DynamoDBDocumentClient) {
    const command = new GetCommand({
        TableName: "Countries",
        Key: {
            CountryCode: search,
        },
    })

    try {
        const response = await docClient.send(command)
        console.log("Retrieved item:", response.Item)
        return response.Item
    } catch (error) {
        console.error("Error retrieving item:", error)
    }
}
async function queryCountry(docClient: DynamoDBClient) {
  const command = new QueryCommand({
    TableName: "Countries",
    KeyConditionExpression: "CountryCode = :countryCode",
    FilterExpression: "LatestTradeData >= :tradeYearValue",
    ExpressionAttributeValues: {
        ":tradeYearValue": 2013,
        ":countryCode": "ALB"
    }
  })

  try {
    const response = await docClient.send(command)
    if (response.Items) {
      console.log("Retrieved item:", response.Items[0])  // Assuming you expect one result
    } else {
      console.log("Item not found")
    }
  } catch (error) {
    console.error("Error querying item:", error)
  }
}

async function scanCountriesByTradeYear(yearThreshold: number, docClient: DynamoDBClient,) {
  const command = new ScanCommand({
    TableName: "Countries",
    FilterExpression: "LatestTradeData >= :tradeYearValue",
    ExpressionAttributeValues: {
      ":tradeYearValue": yearThreshold,
    }
  })

  try {
    const response = await docClient.send(command);
    console.log("Filtered Countries:", response.Items);
    return response.Items;
  } catch (error) {
    console.error("Error scanning DynamoDB:", error);
  }
}

async function main() {
    const docClient = connectToClient()
    // await getCountry("AB", docClient)
    await scanCountriesByTradeYear(2013, docClient)
    
} 

main()