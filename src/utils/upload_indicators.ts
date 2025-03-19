import fs from 'fs'
import path from 'path'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { parse } from 'csv-parse'
import dotenv from 'dotenv'

import { CountryIndicator } from './class_helpers'

dotenv.config()

function connectToClient() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      convertClassInstanceToMap: true
    }
  })

  return docClient
}

async function readFile(fileName: string) {
  const filePath = path.resolve(
    __dirname,
    `../../../src/utils/archive/${fileName}`
  )

  const countryIndicators: CountryIndicator[] = []
  const stream = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 1, columns: true }))

  for await (const row of stream) {
    const {
      CountryName,
      CountryCode,
      IndicatorName,
      IndicatorCode,
      Year,
      Value
    } = row

    const indicator = new CountryIndicator(
      CountryName,
      CountryCode,
      IndicatorName,
      IndicatorCode,
      parseInt(Year),
      parseFloat(Value)
    )

    countryIndicators.push(indicator)
  }

  console.log('Finished processing CSV.')
  return countryIndicators
}

async function uploadIndicators(
  indicators: CountryIndicator[],
  docClient: DynamoDBClient
) {
  const chunkSize = 25

  for (let i = 0; i < indicators.length; i += chunkSize) {
    const batch = indicators.slice(i, i + chunkSize).map((item) => ({
      PutRequest: { Item: item }
    }))

    const command = new BatchWriteCommand({
      RequestItems: {
        Country_Indicators: batch
      }
    })

    try {
      await docClient.send(command)
      console.log(`Uploaded batch ${i / chunkSize + 1}`)
    } catch (error) {
      console.error('Error uploading batch:', error)
    }
  }
}

async function main() {
  const docClient = connectToClient()
  const countryIndicators: CountryIndicator[] = await readFile('Indicators.csv')
  console.log('Updating Indicators')
  await uploadIndicators(countryIndicators, docClient)
}

main()
