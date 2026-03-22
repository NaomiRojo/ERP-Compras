import { EntitySchema } from "typeorm";

export interface CompraDetalleRow {
  id: string;
  docId: string;
  lineNum: number;
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  descripcion: string | null;
  cantidadTotal: string;
  cantidadPendiente: string;
  precioUnitario: string;
  descuentoLinea: string;
  subtotalLinea: string;
  totalLinea: string;
}

export const CompraDetalleEntitySchema = new EntitySchema<CompraDetalleRow>({
  name: "CompraDetalle",
  tableName: "compras_detalle",
  columns: {
    id: { type: "uuid", primary: true },
    docId: { name: "doc_id", type: "uuid" },
    lineNum: { name: "line_num", type: Number },
    articuloId: { name: "articulo_id", type: "uuid" },
    almacenId: { name: "almacen_id", type: String },
    impuestoId: { name: "impuesto_id", type: Number },
    descripcion: { type: "text", nullable: true },
    cantidadTotal: { name: "cantidad_total", type: "numeric", precision: 18, scale: 4 },
    cantidadPendiente: { name: "cantidad_pendiente", type: "numeric", precision: 18, scale: 4 },
    precioUnitario: { name: "precio_unitario", type: "numeric", precision: 18, scale: 4 },
    descuentoLinea: { name: "descuento_linea", type: "numeric", precision: 18, scale: 2 },
    subtotalLinea: { name: "subtotal_linea", type: "numeric", precision: 18, scale: 2 },
    totalLinea: { name: "total_linea", type: "numeric", precision: 18, scale: 2 },
  },
});
