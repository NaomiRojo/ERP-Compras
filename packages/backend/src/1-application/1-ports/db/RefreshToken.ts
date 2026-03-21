import type { RefreshToken } from "src/0-domain/RefreshToken";
import type { User } from "src/0-domain/User";

/**
 * An error for when a refresh token's information couldn't be found in database
 */
export class TokenNotFound extends Error {
  public constructor(msg?: string) {
    super(msg ?? "Could not find token")
  }
}

/**
 * An error for when a user is not found in database
 */
export class UserNotFound extends Error {
  public constructor(msg?: string) {
    super(msg ?? "Could not find user")
  }
}

/**
 * The errors possible during the Find User operation
 */
export type FindUserError = TokenNotFound;

/**
 * The errors possible during the Expire Token operation
 */
export type ExpireRefreshTokenError = TokenNotFound;

/** 
 * The errors possible during a Find Token operation
 */
export type FindTokenError = TokenNotFound;

/**
 * The errors possible during an Issue Refresh Token operation
 */
export type IssueRefreshTokenError = UserNotFound;

/**
 * A port for the operations relating to refresh tokens
 */
export interface RefreshTokenPort {
  /**
   * Operation to issue a new refresh token
   *
   * @param userId The user ID to generate a new token for
   *
   * @returns the new RefreshToken, or an error
   */
  issueRefreshToken(userId: string): RefreshToken | IssueRefreshTokenError
  
  /**
   * Operation to forcefully expire a refresh token
   *
   * @param token The refresh token
   *
   * @returns The expired refresh token, or an error
   */
  expireRefreshToken(token: string): RefreshToken | ExpireRefreshTokenError
  
  /**
   * Operation to find a user from their refresh token
   *
   * @param token The refresh token
   *
   * @returns The found user, or an error
   */
  findUser(token: string): User | FindUserError
  
  /**
   * Operation to find a Refresh Token database object from its token
   *
   * @param token The refresh token
   *
   * @returns The Refresh Token database object, or an error
   */
  findToken(token: string): RefreshToken | FindTokenError

  /**
   * Operation to check whether a refresh token is expired
   *
   * @params token The refresh token
   *
   * @returns Whether the token is expired
   */
  isExpired(token: RefreshToken): boolean
}
