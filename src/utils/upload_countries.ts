import { once } from 'events'
import fs from 'fs'
import path from 'path'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { parse } from 'csv-parse'
import dotenv from 'dotenv'

import { CountryInfo } from './class_helpers'

dotenv.config()

function connectToClient() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  const docClient = DynamoDBDocumentClient.from(client)

  return docClient
}

function parseCountryRow(row: any): CountryInfo {
  const numericFields = new Set([
    'NationalAccountsBaseYear',
    'NationalAccountsReferenceYear',
    'LatestTradeData',
    'LatestAgriculturalCensus',
    'LatestIndustrialData',
    'LatestWaterWithdrawalData',
    'LatestPopulationCensus',
    'PppSurveyYear'
  ])
  const parsedRow: any = { ...row }

  for (const key of numericFields) {
    const value = row[key]

    if (typeof value === 'string' && !isNaN(Number(value))) {
      parsedRow[key] = parseInt(value, 10)
    }
  }

  return parsedRow as CountryInfo
}

async function readFile(fileName: string) {
  const filePath: string = path.resolve(
    __dirname,
    '../../../src/utils/archive',
    fileName
  )
  const records: CountryInfo[] = []

  const stream = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 1, columns: true }))

  stream.on('data', (row) => {
    const country: CountryInfo = parseCountryRow(row)
    console.log(`Processing data for: ${country.ShortName}`)
    records.push(country)
  })

  await once(stream, 'end')
  console.log('Finished processing CSV.')

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
      await docClient.send(command)
      console.log(`Uploaded batch ${i / chunkSize + 1}`)
    } catch (error) {
      console.error('Error uploading batch:', error)
    }
  }
}

async function main() {
  const docClient = connectToClient()
  const records = await readFile('Country.csv')
  await uploadData(records, docClient)
}

main()
