import { EntitySchema } from "typeorm";

export interface UsuarioRow {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  passwordHash: string;
  googleSub: string | null;
  rolId: number;
  activo: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
}

export const UsuarioEntitySchema = new EntitySchema<UsuarioRow>({
  name: "Usuario",
  tableName: "o_usuarios",
  columns: {
    id: { type: "uuid", primary: true },
    username: { type: String, unique: true },
    nombreCompleto: { name: "nombre_completo", type: String },
    email: { type: String, unique: true },
    passwordHash: { name: "password_hash", type: "text" },
    googleSub: { name: "google_sub", type: String, unique: true, nullable: true },
    rolId: { name: "rol_id", type: Number },
    activo: { type: Boolean, default: true },
    twoFactorEnabled: { name: "two_factor_enabled", type: Boolean, default: false },
    twoFactorSecret: { name: "two_factor_secret", type: String, nullable: true },
  },
});
