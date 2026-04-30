import type { OrdenCompraDetalle } from "./OrdenCompraDetalle";

export interface OrdenCompraProps {
  id: string;
  tipoDocId: number;
  docNum: number;
  proveedorId: string;
  estadoId: number;
  monedaId: number;
  fechaDocumento: Date;
  fechaVencimiento?: Date;
  subtotal: number;
  descuentoTotal: number;
  impuestosTotal: number;
  totalDocumento: number;
  comentarios?: string;
  createdBy: string;
  approvedBy?: string;
  detalles: OrdenCompraDetalle[];
}

export class OrdenCompra {
  public constructor(public readonly props: OrdenCompraProps) {}
}
