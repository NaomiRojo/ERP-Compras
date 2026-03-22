export interface PagoProveedorProps {
  id: string;
  cuentaPorPagarId: string;
  monto: number;
  fechaPago: Date;
  referencia?: string;
}

export class PagoProveedor {
  public constructor(public readonly props: PagoProveedorProps) {}
}
