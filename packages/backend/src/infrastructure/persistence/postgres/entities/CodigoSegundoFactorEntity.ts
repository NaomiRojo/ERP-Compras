import { EntitySchema } from "typeorm";

export interface CodigoSegundoFactorRow {
  id: string;
  usuarioId: string;
  codigoHash: string;
  canal: "EMAIL" | "APP";
  expiresAt: Date;
  usedAt: Date | null;
}

export const CodigoSegundoFactorEntitySchema = new EntitySchema<CodigoSegundoFactorRow>({
  name: "CodigoSegundoFactor",
  tableName: "auth_2fa_codes",
  columns: {
    id: { type: "uuid", primary: true },
    usuarioId: { name: "usuario_id", type: "uuid" },
    codigoHash: { name: "codigo_hash", type: String },
    canal: { type: String },
    expiresAt: { name: "expires_at", type: "timestamp" },
    usedAt: { name: "used_at", type: "timestamp", nullable: true },
  },
});
