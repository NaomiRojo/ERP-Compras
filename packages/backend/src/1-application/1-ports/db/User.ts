import type { Verifiers } from "src/0-domain/Password";
import type { User } from "src/0-domain/User";
import type { UserInfo } from "src/0-domain/User";


/**
 * Namespace for errors possible during a User Creation operation
 */
export namespace UserCreateErrors {
  
  /**
   * An error for when an attempt is made to create a User with an existing userName
   */
  export class UserNameAlreadyExists extends Error {
    public constructor(msg?: string) {
      super(msg ?? "The User Name already exists")
    }
  }
}

/**
 * All errors possible during a Create User operation
 */
export type UserCreateError = 
    UserCreateErrors.UserNameAlreadyExists;

/**
 * An error for when the user is not found in the databasse
 */
export class UserNotFound extends Error {
  public constructor(msg?: string | undefined) {
    super(msg ?? "The User could not be found")
  }
}

/**
 * All  errors possible during a Fetch User operation
 */
export type UserFetchError = 
  UserNotFound;

/**
 * A port for User operations in the database
 */
export interface UserPort {
  
  /**
   * An operation to create a new user in the database
   *
   * @param info User information, such as Username
   * @param verifiers User authentication verifiers, such as a password hash, a TOTP key, etc
   *
   * @returns The created user, or an error
   */
  createUser(info: UserInfo, verifiers: Verifiers): UserCreateError | User;
  
  /**
   * An operation to fetch a user by username in the database
   *
   * @param userName The User Name
   *
   * @returns The found User, or an error if none could be found
   */
  fetchByUserName(userName: string): UserFetchError | User;

  /**
   * An operation to fetchh a user by uuid in the database
   *
   * @param uuid The UUID to fetch from database
   *
   * @returns The found User, or an error if none could be found
   */
  fetchByUUID(uuid: string): UserFetchError | User;
}
