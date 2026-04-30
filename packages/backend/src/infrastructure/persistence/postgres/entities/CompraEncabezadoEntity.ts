import { EntitySchema } from "typeorm";

export interface CompraEncabezadoRow {
  id: string;
  tipoDocId: number;
  docNum: number;
  proveedorId: string;
  estadoId: number;
  monedaId: number;
  fechaDocumento: string;
  fechaVencimiento: string | null;
  subtotal: string;
  descuentoTotal: string;
  impuestosTotal: string;
  totalDocumento: string;
  comentarios: string | null;
  createdBy: string;
  approvedBy: string | null;
}

export const CompraEncabezadoEntitySchema = new EntitySchema<CompraEncabezadoRow>({
  name: "CompraEncabezado",
  tableName: "compras_encabezado",
  columns: {
    id: { type: "uuid", primary: true },
    tipoDocId: { name: "tipo_doc_id", type: Number },
    docNum: { name: "doc_num", type: Number },
    proveedorId: { name: "proveedor_id", type: "uuid" },
    estadoId: { name: "estado_id", type: Number },
    monedaId: { name: "moneda_id", type: Number },
    fechaDocumento: { name: "fecha_documento", type: "date" },
    fechaVencimiento: { name: "fecha_vencimiento", type: "date", nullable: true },
    subtotal: { type: "numeric", precision: 18, scale: 2 },
    descuentoTotal: { name: "descuento_total", type: "numeric", precision: 18, scale: 2 },
    impuestosTotal: { name: "impuestos_total", type: "numeric", precision: 18, scale: 2 },
    totalDocumento: { name: "total_documento", type: "numeric", precision: 18, scale: 2 },
    comentarios: { type: "text", nullable: true },
    createdBy: { name: "created_by", type: "uuid" },
    approvedBy: { name: "approved_by", type: "uuid", nullable: true },
  },
});
