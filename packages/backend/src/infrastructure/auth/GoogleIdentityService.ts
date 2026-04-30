import { createRemoteJWKSet, jwtVerify } from "jose";
import type { GoogleIdentity, IGoogleIdentityService } from "src/application/interfaces/IGoogleIdentityService";

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export class GoogleIdentityService implements IGoogleIdentityService {
  public constructor(private readonly audiences: string[]) {}

  public async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    if (this.audiences.length === 0) {
      throw new Error("Google auth no esta configurado");
    }

    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: this.audiences,
    });

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      throw new Error("Token de Google invalido");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === "string" ? payload.name : undefined,
      hostedDomain: typeof payload.hd === "string" ? payload.hd : undefined,
    };
  }
}
