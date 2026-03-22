export interface OrdenCompraDetalleProps {
  id: string;
  lineNum: number;
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  descripcion?: string;
  cantidadTotal: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuentoLinea: number;
  subtotalLinea: number;
  totalLinea: number;
}

export class OrdenCompraDetalle {
  public constructor(public readonly props: OrdenCompraDetalleProps) {}
}
