import type { Claims } from "src/0-domain/Claims";
import type { User } from "src/0-domain/User";

/**
 * A namespace for all errors possible during verification of a JWT
 */
export namespace VerifyJwtErrors {

  /**
   * An error for when a JWT is found to be invalid
   */
  export class InvalidJwt extends Error {
    public constructor(msg?: string) {
      super(msg ?? "Jwt was not valid");
    }
  }

  /**
   * An error for when a JWT could not be decoded
   */
  export class DecodeError extends Error {
    public constructor(msg?: string) {
      super(msg ?? "The Jwt could not be decoded");
    }
  }
}

/**
 * All possible errors during verification of a JWT
 */
export type VerifyJwtError = VerifyJwtErrors.InvalidJwt | VerifyJwtErrors.DecodeError;

/**
 * A port describing operations on JWTs and Claims
 */
export interface JwtPort {
  /**
   * A function that takes an user, and generates a set of claims
   *
   * @param u The user to generate these claims for
   *
   * @returns The claim for this user, at the current time
   */
  newClaims(u: User): Claims
  /**
   * A function that takes a set of claims, and generates a signed Jwt
   * @param u A set of claims to sign
   *
   * @returns The signed JWT
   */
  signJwt(u: Claims): string
  /**
   * A function that takes a signed Jwt, verifies and decodes it.
   * @param j The Jwt
   *
   * @returns A set of claims, or an error verifying or decoding the Jwt
   */
  verifyJwt(j: string): VerifyJwtError | Claims
}
