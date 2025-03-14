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

  public async getSecretValue(): Promise<string | undefined> {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: this.secretName,
          VersionStage: 'AWSCURRENT'
        })
      )
      return response.SecretString
    } catch (error) {
      console.error('Error retrieving API key:', error)
      throw error
    }
  }
}
