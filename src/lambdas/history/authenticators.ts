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
