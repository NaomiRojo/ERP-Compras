import { Entity, PrimaryColumn } from "typeorm";


/**
 * A database model for the Refresh Token
 * Once a token as been expired, through either naturally expiring, or the forceExpired flag being set, 
 * it is candidate for garbage collection in the database, and may not exist in the future.
 */
@Entity()
export class RefreshToken{
  /**
   * Constructor for a refresh token. Is comprised of
   *
   * @param token The Random token for the entity
   * @param forceExpired Whether the token has been manually expired
   * @param expiryTime The time at which the token naturaally expires
   */
  public constructor(token: Uint8Array, forceExpired: boolean, expiryTime: Date) {
    this.token = token;
    this.forceExpired = forceExpired;
    this.expiryTime = expiryTime;
  }

  /**
   * Destructor for the refresh token, to allow easy modification and cloning
   *
   * @returns The token, forceExpired flag, and expiryTime that comprise it
   */
  public destructor(): [ token: Uint8Array, forceExpired: boolean, expiryTime: Date ] {
    return [
      this.token,
      this.forceExpired,
      this.expiryTime
    ];
  }

  /**
   * The token identifying the entity. Should be 64 cryptographically random bytes
   */
  @PrimaryColumn("bytes")
  public token: Uint8Array

  /**
   * The time and date at which the token expires
   */
  @Column({ type: 'timestamptz' })
  public expiryTime: Date

  /**
   * Whether the token has been manually set to expired.
   * Should never be unset once set
   */
  @Column({ type: "bit" })
  public forceExpired: boolean

}
