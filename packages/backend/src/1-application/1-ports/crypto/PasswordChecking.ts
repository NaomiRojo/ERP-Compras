import type { LoginSecrets, RegisterSecrets, Verifiers } from  "src/0-domain/Password";

/**
 * Port for all password checking operations
 */
export interface PasswordChecking {
  /**
   * Function that takes a set of login secrets, its corresponding verifiers, and verifies the login information
   *
   * @param secrets The User's login secrets
   * @param verifier The User's login verifiers
   *
   * @returns Whether the lofin secrets were valid
   */
  check   (secrets: LoginSecrets, verifier: Verifiers): boolean
  /**
   * Function that takes a set of registration secrets, and generates a set of verifiers
   *
   * @param secrets The user's registration secrets
   *
   * @returns The set of new verifiers for the user
   */
  generate(secrets: RegisterSecrets): Verifiers
  /**
   * Function that takes in a set of login secrets, a new set of registration secrets, and outputs a new set of verifiers
   *
   * @param secrets The old login secrets
   * @param newSecrets The new registration secrets
   * 
   * @returns A new set of verifiers, or undefined if the login secrets were invalid
   */
  change  (secrets: LoginSecrets, newSecrets: RegisterSecrets): Verifiers | undefined
}
