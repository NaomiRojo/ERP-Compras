import type { ITokenService } from "src/application/interfaces/ITokenService";

const encoder = new TextEncoder();

const base64UrlEncode = (value: string): string =>
  Buffer.from(value).toString("base64url");

const base64UrlDecode = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const signHmac = async (value: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Buffer.from(signature).toString("base64url");
};

export class JwtService implements ITokenService {
  public constructor(
    private readonly secret: string,
    private readonly expirationSeconds: number,
  ) {}

  public async sign(payload: Record<string, unknown>): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp: now + this.expirationSeconds }));
    const signature = await signHmac(`${header}.${body}`, this.secret);

    return `${header}.${body}.${signature}`;
  }

  public async verify(token: string): Promise<Record<string, unknown>> {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) {
      throw new Error("Token invalido");
    }

    const expectedSignature = await signHmac(`${header}.${body}`, this.secret);
    if (expectedSignature !== signature) {
      throw new Error("Token invalido");
    }

    const payload = JSON.parse(base64UrlDecode(body)) as Record<string, unknown>;
    const exp = typeof payload.exp === "number" ? payload.exp : 0;
    if (exp <= Math.floor(Date.now() / 1000)) {
      throw new Error("Token expirado");
    }

    return payload;
  }
}
