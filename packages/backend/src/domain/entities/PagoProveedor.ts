export interface PagoProveedorProps {
  id: string;
  cuentaPorPagarId: string;
  proveedorId: string;
  monto: number;
  fechaPago: Date;
  referencia?: string;
  createdBy: string;
}

export class PagoProveedor {
  public constructor(public readonly props: PagoProveedorProps) {}
}
