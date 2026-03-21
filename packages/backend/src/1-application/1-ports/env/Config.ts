

/**
 * A port to expose configuration settings
 */
export interface Config {
  /**
   * The length of time a user JWT is valid for
   */
  jwtValiditySeconds: number
  /**
   * The length of time a Refresh Token is valid for
   */
  refreshTokenValiditySeconds: number
}
