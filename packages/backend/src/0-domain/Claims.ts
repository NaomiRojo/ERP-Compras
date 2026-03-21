/**
 * The Claims used by the JWT system
 */
export interface Claims {
  /**
   * The User. Identified by UUID
   */
  sub: string,
  /**
   * Time at which the token was issued
   */
  iat: string,
  /**
   * Time at which the token becomes valid
   */
  nbf: string,
  /**
   * Time at which the token expires
   */
  exp: string
}
