import fs from "fs"
import path from "path"

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {BatchWriteCommand, DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb"
import { parse } from "csv-parse"
import dotenv from 'dotenv'

import { CountryInfo } from "./helpers" 

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

async function readFile() {
    const filePath = path.resolve(__dirname, "../../../src/utils/archive/Country.csv")
    const records: CountryInfo[] = []

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(parse({ delimiter: ",", from_line: 1, columns: true }))
            .on("data", function (row) {
                const country: CountryInfo = row
                console.log(`Processing data for: ${country.ShortName}`)
                records.push(country)
            })
            .on("end", function () {
                console.log("Finished processing CSV.")
                resolve() 
            })
            .on("error", function (error) {
                console.log(error.message)
                reject(error)
            })
    })
    return records
}

async function uploadData(records: CountryInfo[], docClient: DynamoDBClient) {
    const chunkSize = 25

    for (let i = 0; i < records.length; i += chunkSize) {
        const batch = records.slice(i, i + chunkSize).map((item) => ({
            PutRequest: { Item: item }
        }))

        const command = new BatchWriteCommand({
            RequestItems: {
                Countries: batch
            }
        })

        try {
            await docClient.send(command);
            console.log(`Uploaded batch ${i / chunkSize + 1}`)
        } catch (error) {
            console.error("Error uploading batch:", error)
        }
    }
}


async function main() {
    const docClient = connectToClient()
    const records = await readFile()
    await uploadData(records, docClient)
}

main()