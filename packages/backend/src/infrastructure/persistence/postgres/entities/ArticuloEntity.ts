import { EntitySchema } from "typeorm";

export interface ArticuloRow {
  id: string;
  itemCode: string;
  itemName: string;
  descripcion: string | null;
  unidadMedida: string;
  costoEstandar: string;
  grupoId: number;
  impuestoId: number;
  activo: boolean;
}

export const ArticuloEntitySchema = new EntitySchema<ArticuloRow>({
  name: "Articulo",
  tableName: "o_articulos",
  columns: {
    id: { type: "uuid", primary: true },
    itemCode: { name: "item_code", type: String, unique: true },
    itemName: { name: "item_name", type: String },
    descripcion: { type: "text", nullable: true },
    unidadMedida: { name: "unidad_medida", type: String },
    costoEstandar: { name: "costo_estandar", type: "numeric", precision: 18, scale: 4 },
    grupoId: { name: "grupo_id", type: Number },
    impuestoId: { name: "impuesto_id", type: Number },
    activo: { type: Boolean, default: true },
  },
});
