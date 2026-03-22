import { EntitySchema } from "typeorm";

export interface ProveedorRow {
  id: string;
  cardCode: string;
  cardName: string;
  nombreComercial: string | null;
  nitRut: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  monedaId: number;
  balanceCuenta: string;
  lineaCredito: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ProveedorEntitySchema = new EntitySchema<ProveedorRow>({
  name: "Proveedor",
  tableName: "o_proveedores",
  columns: {
    id: {
      type: "uuid",
      primary: true,
    },
    cardCode: {
      name: "card_code",
      type: String,
      unique: true,
    },
    cardName: {
      name: "card_name",
      type: String,
    },
    nombreComercial: {
      name: "nombre_comercial",
      type: String,
      nullable: true,
    },
    nitRut: {
      name: "nit_rut",
      type: String,
    },
    email: {
      type: String,
      nullable: true,
    },
    telefono: {
      type: String,
      nullable: true,
    },
    direccion: {
      type: "text",
      nullable: true,
    },
    monedaId: {
      name: "moneda_id",
      type: Number,
    },
    balanceCuenta: {
      name: "balance_cuenta",
      type: "numeric",
      precision: 18,
      scale: 2,
      default: 0,
    },
    lineaCredito: {
      name: "linea_credito",
      type: "numeric",
      precision: 18,
      scale: 2,
      default: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
  },
});
