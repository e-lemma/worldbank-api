import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { fromEnv } from '@aws-sdk/credential-providers'

export class AccessKeyRetriever {
  private readonly client: SecretsManagerClient
  private readonly secretName: string

  constructor(
    region: string = process.env.AWS_REGION || 'eu-west-2',
    secretName: string = process.env.AWS_SECRET_NAME || 'dg/api_key'
  ) {
    this.client = new SecretsManagerClient({
      region,
      credentials: fromEnv()
    })
    this.secretName = secretName
  }

  public async getSecretObject(): Promise<Record<string, string>> {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: this.secretName,
          VersionStage: 'AWSCURRENT'
        })
      )

      if (!response.SecretString) {
        throw new Error('API key not found.')
      }

      return JSON.parse(response.SecretString)
    } catch (error) {
      console.error('Error retrieving API key:', error)
      throw error
    }
  }

  static async retrieveApiKey(
    region?: string,
    secretName?: string
  ): Promise<string> {
    const retriever = new AccessKeyRetriever(region, secretName)
    const keyObject = await retriever.getSecretObject()

    if (!keyObject.api_key) {
      throw new Error('API key property not found in the secret')
    }

    return keyObject.api_key
  }
}
