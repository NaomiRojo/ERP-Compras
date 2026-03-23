export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  hostedDomain?: string;
}

export interface IGoogleIdentityService {
  verifyIdToken(idToken: string): Promise<GoogleIdentity>;
}
