import type { LoginSecrets, RegisterSecrets } from "src/0-domain/Password";
import type { PasswordChecking } from "src/1-application/1-ports/db/PasswordChecking";
import type { UserFetchError, UserPort } from "src/1-application/1-ports/db/User";
import { User, type UserInfo, verifiers } from "src/0-domain/User";
import type { JwtPort } from "../1-ports/crypto/Jwt";
import { RefreshToken } from "src/0-domain/RefreshToken";
import type { FindTokenError, FindUserError, RefreshTokenPort } from "../1-ports/db/RefreshToken";
import type { Claims } from "src/0-domain/Claims";

/**
 * Function that registers a user, given some user information and their secrets
 *
 * @param p The password checking port
 * @param u The User operations port
 * @param info The User information
 * @param secrets Secrets neded to register the user
 * @returns The created user, or an error
 */
export const register = (p: PasswordChecking, u: UserPort) => (info: UserInfo, secrets: RegisterSecrets) => (
  u.createUser(info, p.generate(secrets))
);

/**
 * Namespace containing possible errors during the login operation
 */
export namespace LoginErrors {
  /**
   * The user or password was incorrect
   * Both errors are joined together for secutiry reasons
   * If this weren't the case it would allow any adversary to identify which usernames were registered or not
   * This, however, is not sufficient due to timing attacks, though this might not be possible
   * at all due to how javascript works.
   * TODO: Fix vulnerability to timing attacks
   */
  export class UserOrPasswordIncorrect extends Error {
    public constructor(msg?: string | undefined) {
      super(msg ?? "User or Password was incorrect")
    }
  }
}

/**
 * All errors posible during login
 */
export type LoginError = LoginErrors.UserOrPasswordIncorrect;

/**
 * Function that logs in a user, given their username and login secrets
 *
 * @param p The Password Checking port
 * @param u The User operations port
 * @param j The Jwt operations port
 * @param t The Refresh token port
 * @param userName The username to login
 * @param secrets The user's login secrets
 *
 * @returns A 2-tuple consisting of the signed Jwt, and a Refresh Token, or an error
 */
export const login = (p: PasswordChecking, u: UserPort, j: JwtPort, t: RefreshTokenPort) => (userName: string, secrets: LoginSecrets): [string,RefreshToken] | LoginError => {
    // First fetch the User, if we can't, report an error
    const user = u.fetchByUserName(userName);
    if(!(user instanceof User))            return new LoginErrors.UserOrPasswordIncorrect();

    // Then check the secrets. If they're wrong, report an error
    if(!p.check(secrets, verifiers(user))) return new LoginErrors.UserOrPasswordIncorrect();

    // Create a new set of claims for this user, right now
    const claims = j.newClaims(user);

    // Sign a JWT for use by the user
    const jwt = j.signJwt(claims);

    // Issue a refresh token for the new login. If we can't, return an error
    const refreshToken = t.issueRefreshToken(user.id);
    if(!(refreshToken instanceof RefreshToken)) return new LoginErrors.UserOrPasswordIncorrect();

    // Return the JWT and the Refresh Token
    return [jwt,refreshToken];
}

/**
 * Namespace containing errors possible during refresh
 */
export namespace RefreshErrors {
  /**
   * An error to indicate the refresh token is expired
   */
  export class RefreshTokenExpired extends Error {
    public constructor(msg?: string) {
      super(msg ?? "Refresh token was expired")
    }
  }
}

/**
 * All errors possible during a refresh
 */
export type RefreshError = FindTokenError | FindUserError | RefreshErrors.RefreshTokenExpired;

/**
 * A function which takes an user's refresh token, and yields a new JWT
 *
 * @param j The JWT operations port
 * @param t The Refresh Token port
 * @param token The refresh token to use
 *
 * @returns The new JWT, or an error
 */
export const refresh = (j: JwtPort, t: RefreshTokenPort) => (token: string): string | RefreshError => {
  // First we fetch the refresh token from database
  const refreshToken = t.findToken(token);
  if(!(refreshToken instanceof RefreshToken)) return refreshToken;

  // Then we check if it is expired
  if(t.isExpired(refreshToken)) return new RefreshErrors.RefreshTokenExpired();

  // Then we find the relevant user from database
  const user = t.findUser(token);
  if(!(user instanceof User)) return user;

  // Then we generate a new set of claims for the user
  const claims = j.newClaims(user);

  // Finally, we sign a JWT with those claims
  const jwt = j.signJwt(claims);

  // And return it
  return jwt;
};

/**
 * A function which takes a user's claims, and returns the user's UserInfo
 *
 * @param u The User port
 * @param claims The relevant Claims
 *
 * @returns The User's info, or an error during fetching
 */
export const me = (u: UserPort) => (claims: Claims): UserInfo | UserFetchError => u.fetchByUUID(claims.sub);
