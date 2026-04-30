import { EntitySchema } from "typeorm";
import type { SegundoFactorCanal } from "src/domain/entities/SegundoFactorCanal";

export interface CodigoSegundoFactorRow {
  id: string;
  usuarioId: string;
  codigoHash: string;
  canal: SegundoFactorCanal;
  destino: string | null;
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
    destino: { type: String, nullable: true },
    expiresAt: { name: "expires_at", type: "timestamp" },
    usedAt: { name: "used_at", type: "timestamp", nullable: true },
  },
});
