import { EntitySchema } from "typeorm";

export interface RefreshTokenSesionRow {
  id: string;
  usuarioId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export const RefreshTokenSesionEntitySchema = new EntitySchema<RefreshTokenSesionRow>({
  name: "RefreshTokenSesion",
  tableName: "auth_refresh_tokens",
  columns: {
    id: { type: "uuid", primary: true },
    usuarioId: { name: "usuario_id", type: "uuid" },
    tokenHash: { name: "token_hash", type: "text" },
    expiresAt: { name: "expires_at", type: "timestamp" },
    revokedAt: { name: "revoked_at", type: "timestamp", nullable: true },
  },
});
