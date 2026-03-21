
/**
 * Verifiers for the user
 * TODO This should be a password hash (Hashed via Argon2id or similar)
 * TODO This should have a TOTP Key
 */
export interface Verifiers {
  password: string
}

/**
 * Login secrets for the uer
 * TODO This should have a TOTP code
 */
export interface LoginSecrets {
  password: string
}

/**
 * Registration secrets for the user
 */
export interface RegisterSecrets {
  password: string
}
