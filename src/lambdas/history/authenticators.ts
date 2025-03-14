export class AccessKeyAuthenticator {
  private validKey: string

  constructor(apiKey: string) {
    this.validKey = apiKey
  }

  verify(accessKey: string | undefined): boolean {
    if (!accessKey) return false
    return accessKey === this.validKey
  }
}

export class AccountDetailsAuthenticator {
  static async verifyPassword() {}

  static async authenticateCredentials(
    email: string | undefined,
    password: string | undefined
  ): Promise<boolean> {
    if (!email || !password) {
      return false
    }

    // search up email in db
    // if exists, search up password, otherwise return false
    // if password in db matches given password, return true
    // else return false
    return false
  }
}
