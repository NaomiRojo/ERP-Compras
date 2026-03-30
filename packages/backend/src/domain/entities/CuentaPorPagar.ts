export type EstadoCuentaPorPagar = "PENDIENTE" | "PARCIAL" | "PAGADA" | "ANULADA";

export interface CuentaPorPagarProps {
  id: string;
  compraId: string;
  proveedorId: string;
  numeroFactura: string;
  montoTotal: number;
  saldoPendiente: number;
  fechaVencimiento: Date;
  estado: EstadoCuentaPorPagar;
}

export class CuentaPorPagar {
  public constructor(public readonly props: CuentaPorPagarProps) {}
}
