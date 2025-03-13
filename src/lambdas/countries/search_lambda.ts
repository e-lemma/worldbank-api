import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, GetCommand} from "@aws-sdk/lib-dynamodb"
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

async function main() {
    
    const docClient = connectToClient()
    await getCountry("AB", docClient)
    
} 

main()